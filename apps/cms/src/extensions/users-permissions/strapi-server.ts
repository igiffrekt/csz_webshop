import type { Core } from "@strapi/strapi";

export default (plugin: { controllers: Record<string, unknown>; routes: { "content-api": { routes: Array<{ method: string; path: string; handler: string; config: { prefix: string; policies?: Array<string | { name: string; config: unknown }> } }> } } }) => {
  // Extend the user controller with updateMe action
  const originalUserController = plugin.controllers.user as Record<string, unknown>;

  plugin.controllers.user = {
    ...originalUserController,

    /**
     * Update the authenticated user's own profile
     */
    async updateMe(ctx: Core.Context) {
      const authUser = ctx.state.user;

      if (!authUser) {
        return ctx.unauthorized("You must be logged in to update your profile");
      }

      const userService = strapi.plugin("users-permissions").service("user");

      // Only allow updating specific fields (not email, username, password, role, etc.)
      const allowedFields = ["firstName", "lastName", "phone", "companyName", "vatNumber"];
      const updateData: Record<string, unknown> = {};

      for (const field of allowedFields) {
        if (ctx.request.body[field] !== undefined) {
          updateData[field] = ctx.request.body[field];
        }
      }

      if (Object.keys(updateData).length === 0) {
        return ctx.badRequest("No valid fields to update");
      }

      try {
        const updatedUser = await userService.edit(authUser.id, updateData);

        // Sanitize output to remove sensitive fields
        const schema = strapi.getModel("plugin::users-permissions.user");
        const sanitizedUser = await strapi.contentAPI.sanitize.output(updatedUser, schema, {
          auth: ctx.state.auth,
        });

        ctx.body = sanitizedUser;
      } catch (error) {
        strapi.log.error("Error updating user profile:", error);
        return ctx.badRequest("Failed to update profile");
      }
    },
  };

  // Add the PUT /users/me route
  plugin.routes["content-api"].routes.push({
    method: "PUT",
    path: "/users/me",
    handler: "user.updateMe",
    config: {
      prefix: "",
      policies: [],
    },
  });

  return plugin;
};
