import fs from "fs";
import path from "path";
import { consola } from "consola";
const tableName = process.argv[2];
const capitalizedTableName = tableName.charAt(0).toUpperCase() + tableName.slice(1);
import { execSync } from "child_process";

if (!tableName) {
  consola.error(
    new Error("Please provide a table name like so: pnpm run generate:api <tablename>"),
  );
  process.exit(1);
}
consola.start("Running API generator for table: ", tableName);
// Directory paths
const serviceDir = path.join("server", "services", "db");
const apiDir = path.join("server", "api", tableName);

// Ensure directories exist
fs.mkdirSync(serviceDir, { recursive: true });
fs.mkdirSync(apiDir, { recursive: true });

// Template for service actions
const serviceTemplate = `
import { eq } from "drizzle-orm";

class ${capitalizedTableName}Actions {
  async create${capitalizedTableName}(payload, userId) {
    try {
      const record = await useDB()
        .insert(tables.${tableName})
        .values({ ...payload, userId })
        .onConflictDoUpdate({
          target: tables.${tableName}.id,
          set: payload,
        })
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to create ${tableName}");
    }
  }

  async find${capitalizedTableName}ById(id) {
    try {
      const [record] = await useDB().select().from(tables.${tableName}).where(eq(tables.${tableName}.id, id));
      return record || null;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to find ${tableName} by ID");
    }
  }

  async update${capitalizedTableName}(id, payload) {
    try {
      const record = await useDB()
        .update(tables.${tableName})
        .set(payload)
        .where(eq(tables.${tableName}.id, id))
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to update ${tableName}");
    }
  }

  async delete${capitalizedTableName}(id) {
    try {
      const record = await useDB()
        .delete(tables.${tableName})
        .where(eq(tables.${tableName}.id, id))
        .returning()
        .get();
      return record;
    } catch (error) {
      console.error(error);
      throw new Error(\`Failed to delete ${tableName}: \${error}\`);
    }
  }

  async find${capitalizedTableName}sByUserId(userId) {
    try {
      const records = await useDB()
        .select()
        .from(tables.${tableName})
        .where(eq(tables.${tableName}.userId, userId));
      return records;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

export const ${tableName}Actions = new ${capitalizedTableName}Actions();
`;
// Write service actions to file
fs.writeFileSync(
  path.join(serviceDir, `${capitalizedTableName}Actions.js`),
  serviceTemplate.trim(),
);

consola.success(`CRUD actions for table: ${tableName} generated`);

// API endpoint templates
const apiTemplates = {
  "index.get.js": `
  import { ${tableName}Actions } from "~/server/services/db/${capitalizedTableName}Actions";

  export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event);
    const records = await ${tableName}Actions.find${capitalizedTableName}sByUserId(user.id);
    return records;
  });
  `,
  "[id].get.js": `
  import { ${tableName}Actions } from "~/server/services/db/${capitalizedTableName}Actions";

  export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event);
    const recordId = getRouterParam(event, "id");
    const record = await ${tableName}Actions.find${capitalizedTableName}ById(recordId, user.id);
    return record;
  });
  `,
  "index.post.js": `
  import { ${tableName}Actions } from "~/server/services/db/${capitalizedTableName}Actions";
  import { z } from "zod";

  export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event);

    const body = await readBody(event);
    const { title, content } = body;
    const record = await ${tableName}Actions.create${capitalizedTableName}(
      { title, content },
      user.id,
    );
    return record;
  });
  `,
  "[id].delete.js": `
  import { ${tableName}Actions } from "~/server/services/db/${capitalizedTableName}Actions";

  export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event);
    const recordId = getRouterParam(event, "id");
    const record = await ${tableName}Actions.find${capitalizedTableName}ById(recordId);
    if (!record || record.userId !== user.id) {
      throw createError({ statusCode: 404, message: "${capitalizedTableName} not found" });
    }
    await ${tableName}Actions.delete${capitalizedTableName}(recordId);
    return { success: true };
  });
  `,
  "[id].patch.js": `
  import { ${tableName}Actions } from "~/server/services/db/${capitalizedTableName}Actions";

  export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event);
    const recordId = getRouterParam(event, "id");
    const record = await ${tableName}Actions.find${capitalizedTableName}ById(recordId);
    if (!record || record.userId !== user.id) {
      throw createError({ statusCode: 404, message: "${capitalizedTableName} not found" });
    }
    const updatedRecord = await ${tableName}Actions.update${capitalizedTableName}(recordId, {
      title: record.title,
      content: record.content,
    });
    return updatedRecord;
  });
  `,
};
consola.success(`API endpoints for table: ${tableName} generated`);
// Write API endpoint files
for (const [fileName, template] of Object.entries(apiTemplates)) {
  fs.writeFileSync(path.join(apiDir, fileName), template.trim());
}

consola.success(`API endpoint is ready 🚀`);
consola.info("Formatting files... 🧹");
execSync("pnpm format");
consola.success("Files formatted successfully ✨");
