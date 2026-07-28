import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/contacts",
    name: "contacts",
    component: () => import("../views/ContactsView.vue"),
  },
  {
    path: "/invoice",
    name: "invoice",
    component: () => import("../views/InvoiceView.vue"),
  },
  {
    path: "/mail",
    redirect: "/invoice",
  },
  {
    path: "/todo",
    name: "todo",
    component: () => import("../views/todoList.vue"),
  },
  {
    path: "/project",
    name: "project",
    component: () => import("../views/projectManagement.vue"),
  },
  {
    path: "/finance",
    name: "finance",
    component: () => import("../views/moneyTracker.vue"),
  },
  {
    path: "/games",
    name: "games",
    component: () => import("../views/MiniGamesView.vue"),
  },
  {
    path: "/habits",
    redirect: "/",
  },
  {
    path: "/calendar",
    name: "calendar",
    component: () => import("../views/CalendarView.vue"),
  },
  {
    path: "/notes",
    name: "notes",
    component: () => import("../views/StickyNotesView.vue"),
  },
  {
    path: "/settings",
    name: "settings",
    component: () => import("../views/PreferencesView.vue"),
  },
  {
    path: "/preferences",
    name: "preferences",
    component: () => import("../views/PreferencesView.vue"),
  },
  {
    path: "/faq",
    name: "faq",
    component: () => import("../views/FaqAboutView.vue"),
  },
  {
    path: "/chat",
    redirect: "/faq",
  },
  {
    path: "/about",
    name: "about",
    component: () => import("../views/FaqAboutView.vue"),
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;
