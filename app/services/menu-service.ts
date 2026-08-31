export interface MenuItem {
  icon: string;
  title: string;
  to: string;
  children?: MenuItem[];
}

export class MenuService {
  constructor(
    private authenticated: boolean,
    private hasPermission: (perm: string) => boolean,
  ) {}

  getMenu(): MenuItem[] {
    const menu: MenuItem[] = [];

    if (this.authenticated) {
      menu.push({
        icon: "mdi-view-dashboard",
        title: "Dashboard",
        to: "/dashboard",
      });

      if (this.hasPermission("organization-index"))
        menu.push({ icon: "mdi-domain", title: "Orgs", to: "/organization" });
      if (this.hasPermission("user-index"))
        menu.push({ icon: "mdi-account", title: "Usuarios", to: "/user" });
      if (this.hasPermission("role-index"))
        menu.push({ icon: "mdi-redhat", title: "Roles", to: "/role" });
      if (this.hasPermission("permission-index"))
        menu.push({
          icon: "mdi-key-variant",
          title: "Permisos",
          to: "/permission",
        });
      if (this.hasPermission("auditorium-index"))
        menu.push({ icon: "mdi-seat", title: "Auditorio", to: "/auditorium" });
      if (this.hasPermission("auditorium-event-index"))
        menu.push({
          icon: "mdi-theater",
          title: "Eventos de Auditorio",
          to: "/auditorium-event",
        });

      if (this.hasPermission("life-group-index")) {
        menu.push({
          icon: "mdi-account-group",
          title: "Redes de Vida",
          to: "/life-group",
          children: [
            { title: "Redes", to: "/life-group", icon: "mdi-account-group" },
            {
              title: "Dashboard",
              to: "/life-group/dashboard",
              icon: "mdi-view-dashboard",
            },
            {
              title: "Reportes",
              to: "/life-group/reports",
              icon: "mdi-file-chart-outline",
            },
          ],
        });
      }

      if (this.hasPermission("store-index")) {
        menu.push({ icon: "mdi-store", title: "Tiendas", to: "/store" });
      }

      if (this.hasPermission("product-index")) {
        menu.push({
          icon: "mdi-package-variant",
          title: "Productos",
          to: "/pos/product",
        });
      }

      if (this.hasPermission("sale-index")) {
        menu.push({ icon: "mdi-point-of-sale", title: "POS", to: "/pos" });
        menu.push({ icon: "mdi-sale", title: "Ventas", to: "/pos/sales" });
        menu.push({
          icon: "mdi-cash-register",
          title: "Cierre de Caja",
          to: "/pos/cash-close",
        });
      }

      if (this.hasPermission("pos-kds")) {
        menu.push({
          icon: "mdi-chef-hat",
          title: "Pantalla de Cocina",
          to: "/pos/kds",
        });
      }

      if (this.hasPermission("expense-ticket-index")) {
        menu.push({
          icon: "mdi-receipt",
          title: "Ticket de Gastos",
          to: "/expense-ticket",
        });
      }

      if (this.hasPermission("testimony-index")) {
        menu.push({
          icon: "mdi-comment-text",
          title: "Testimonios",
          to: "/testimony",
        });
      }

      menu.push({
        icon: "mdi-music-note-eighth",
        title: "Cancionero",
        to: "/song",
      });

      if (this.hasPermission("church-event-index")) {
        menu.push({
          icon: "mdi-calendar",
          title: "Eventos  Iglesia",
          to: "/church-event",
        });
      }

      if (this.hasPermission("conso-sheet-index")) {
        menu.push({
          icon: "mdi-account-multiple",
          title: "Consolidación",
          to: "/consolidation",
        });
        menu.push({
          icon: "mdi-account-search",
          title: "Seguimiento",
          to: "/tracking",
        });
      }

      if (this.hasPermission("whatsapp-index")) {
        menu.push({
          icon: "mdi-whatsapp",
          title: "WhatsApp",
          to: "/whatsapp",
        });
      }

      if (this.hasPermission("ukelele-course")) {
        menu.push({
          icon: "mdi-guitar-acoustic",
          title: "Ukelele",
          to: "/courses/ukelele",
          children: [
            { title: "Día 1", to: "/courses/ukelele?day=1&order=TR,P" },
            { title: "Día 2", to: "/courses/ukelele?day=2&order=TR,P" },
            { title: "Día 3", to: "/courses/ukelele?day=3&order=TR,P" },
            { title: "Día 4", to: "/courses/ukelele?day=4&order=TR,P" },
            { title: "Día 5", to: "/courses/ukelele?day=5&order=TR,P" },
            { title: "Día 6", to: "/courses/ukelele?day=6&order=TR,P" },
          ],
        });
      }

      if (this.hasPermission("sing-course")) {
        menu.push({
          icon: "mdi-microphone",
          title: "Canto",
          to: "/courses/sing",
          children: [
            { title: "Día 1", to: "/courses/sing?day=1&order=TR,P" },
            { title: "Día 2", to: "/courses/sing?day=2&order=TR,P" },
            { title: "Día 3", to: "/courses/sing?day=3&order=TR,P" },
            { title: "Día 4", to: "/courses/sing?day=4&order=TR,P" },
            { title: "Día 5", to: "/courses/sing?day=5&order=TR,P" },
            { title: "Día 6", to: "/courses/sing?day=6&order=TR,P" },
            { title: "Día 7", to: "/courses/sing?day=7&order=TR,P" },
            { title: "Día 8", to: "/courses/sing?day=8&order=TR,P" },
            { title: "Día 9", to: "/courses/sing?day=9&order=TR,P" },
            { title: "Día 10", to: "/courses/sing?day=10&order=TR,P" },
            { title: "Día 11", to: "/courses/sing?day=11&order=TR,P" },
            { title: "Día 12", to: "/courses/sing?day=12&order=TR,P" },
            { title: "Día 13", to: "/courses/sing?day=13&order=TR,P" },
            { title: "Día 14", to: "/courses/sing?day=14&order=TR,P" },
            { title: "Día 15", to: "/courses/sing?day=15&order=TR,P" },
            { title: "Día 16", to: "/courses/sing?day=16&order=TR,P" },
            { title: "Día 17", to: "/courses/sing?day=17&order=TR,P" },
            { title: "Día 18", to: "/courses/sing?day=18&order=TR,P" },
          ],
        });
      }

      if (this.hasPermission("breath-train")) {
        menu.push({ icon: "mdi-meditation", title: "Relax", to: "/relax" });
      }

      if (this.hasPermission("pitch-train")) {
        menu.push({ icon: "mdi-tune", title: "Tuner", to: "/pitcher" });
      }
    } else {
      menu.push({
        icon: "mdi-lock",
        title: "Inicia Sesión",
        to: "/login",
      });
    }

    const uniqueArr = menu.filter(
      (v, i, a) => a.findIndex((t) => t.to === v.to) === i,
    );
    return uniqueArr;
  }
}
