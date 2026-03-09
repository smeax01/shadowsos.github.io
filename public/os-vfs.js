class VirtualFileSystem {
  constructor() {
    this.fs = {};
    this.rootId = 'root';
    this.load();
    this.diagnose();
    this.ensureDefaultFolders();
  }

  diagnose() {
    console.log("VFS: Checking storage...");
    const dataSize = JSON.stringify(this.fs).length;
    console.log(`VFS: Current FS size: ${dataSize} chars`);
    if (dataSize < 100) {
      console.warn("VFS: FS seems too small, repairing...");
      this.ensureDefaultFolders();
    }
  }

  reset() {
    console.warn("VFS: Full Reset Triggered");
    localStorage.removeItem('shadowos_vfs');
    this.fs = {};
    this.ensureDefaultFolders();
    window.location.reload();
  }

  load() {
    try {
      const saved = localStorage.getItem('shadowos_vfs');
      if (saved) {
        this.fs = JSON.parse(saved);
      }
    } catch (e) {
      console.error("VFS load error", e);
    }
  }

  save() {
    try {
      localStorage.setItem('shadowos_vfs', JSON.stringify(this.fs));
      window.dispatchEvent(new CustomEvent('vfs-changed'));
    } catch (e) {
      if(e.name === 'QuotaExceededError') {
        alert("Stockage plein ! Impossible de sauvegarder.");
      }
    }
  }

  ensureDefaultFolders() {
    const defaults = {
      'root': { id: 'root', type: 'folder', name: 'Root', parentId: null, date: Date.now() },
      'desktop': { id: 'desktop', type: 'folder', name: 'Bureau', parentId: 'root', date: Date.now() },
      'documents': { id: 'documents', type: 'folder', name: 'Documents', parentId: 'root', date: Date.now() },
      'downloads': { id: 'downloads', type: 'folder', name: 'Téléchargements', parentId: 'root', date: Date.now() },
      'pictures': { id: 'pictures', type: 'folder', name: 'Images', parentId: 'root', date: Date.now() },
      'videos': { id: 'videos', type: 'folder', name: 'Vidéos', parentId: 'root', date: Date.now() }
    };
    
    let changed = false;
    for (const [id, data] of Object.entries(defaults)) {
      if (!this.fs[id]) {
        console.log(`VFS: Creating missing default folder: ${id}`);
        this.fs[id] = data;
        changed = true;
      }
    }
    
    // Safety check: ensure 'desktop' is not orphelin
    if (this.fs['desktop'] && !this.fs['root']) {
      this.fs['root'] = defaults['root'];
      changed = true;
    }

    if (changed) {
      this.save();
      console.log("VFS: Default structure verified and updated.");
    }
  }

  createId() {
    return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  createFolder(name, parentId = 'desktop') {
    const id = this.createId();
    this.fs[id] = { id, type: 'folder', name, parentId, date: Date.now() };
    this.save();
    return id;
  }

  createFile(name, type, content, parentId = 'desktop') {
    const id = this.createId();
    this.fs[id] = { id, type, name, content, parentId, date: Date.now() };
    this.save();
    return id;
  }

  createAppShortcut(appId, name, icon, parentId = 'desktop') {
    const id = this.createId();
    this.fs[id] = { id, type: 'app', appId, name, icon: icon, parentId, date: Date.now() };
    this.save();
    return id;
  }

  getItem(id) {
    return this.fs[id];
  }

  getChildren(parentId) {
    return Object.values(this.fs).filter(item => item.parentId === parentId);
  }

  deleteItem(id) {
    if (['root', 'desktop', 'documents', 'downloads', 'pictures', 'videos'].includes(id)) return false; // protected
    const item = this.fs[id];
    if (!item) return false;
    
    // delete children if folder
    if (item.type === 'folder') {
      const children = this.getChildren(id);
      children.forEach(child => this.deleteItem(child.id));
    }
    
    delete this.fs[id];
    this.save();
    return true;
  }

  renameItem(id, newName) {
    const item = this.fs[id];
    if (item) {
      item.name = newName;
      this.save();
      return true;
    }
    return false;
  }

  updateContent(id, content) {
    const item = this.fs[id];
    if (item) {
      item.content = content;
      item.date = Date.now();
      this.save();
      return true;
    }
    return false;
  }

  moveItem(id, newParentId) {
    const item = this.fs[id];
    if (item && this.fs[newParentId] && this.fs[newParentId].type === 'folder') {
      item.parentId = newParentId;
      this.save();
      return true;
    }
    return false;
  }

  copyItem(id, newParentId) {
    const item = this.fs[id];
    if (!item) return;
    
    // Deep copy logic
    const copyRecursive = (itemToCopy, parentId) => {
      const newId = this.createId();
      const newItem = { ...itemToCopy, id: newId, parentId, name: itemToCopy.name + (itemToCopy.id === id ? ' (Copie)' : ''), date: Date.now() };
      this.fs[newId] = newItem;
      
      if (itemToCopy.type === 'folder') {
        const children = this.getChildren(itemToCopy.id);
        children.forEach(child => copyRecursive(child, newId));
      }
      return newId;
    }
    
    const newId = copyRecursive(item, newParentId);
    this.save();
    return newId;
  }

  getPath(id) {
    const path = [];
    let current = this.fs[id];
    while (current) {
      path.unshift({ id: current.id, name: current.name });
      current = this.fs[current.parentId];
    }
    return path;
  }

  getFileExtension(name) {
    const parts = name.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  }

  getIconForFile(item) {
    if (item.type === 'folder') return 'folder';
    if (item.type === 'app') return item.icon || 'box';
    
    const ext = this.getFileExtension(item.name);
    if (['txt', 'md', 'json', 'js', 'html', 'css'].includes(ext)) return 'file-text';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'avi', 'mov'].includes(ext)) return 'film';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive';
    return 'file';
  }
}

window.vfs = new VirtualFileSystem();
