import pool from "../../lib/db.js";
import { verifyToken } from "../../lib/auth.js";

export const POST = async ({ request, cookies }) => {
  try {
    const session = cookies.get("shadow_session")?.value;
    const userPayload = session ? await verifyToken(session) : null;

    if (!userPayload) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { vfs_data, used_storage } = await request.json();

    await pool.execute(
      "UPDATE users SET vfs_data = ?, used_storage = ? WHERE id = ?",
      [JSON.stringify(vfs_data), used_storage || 0, userPayload.id]
    );

    return new Response(JSON.stringify({ success: true }));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
