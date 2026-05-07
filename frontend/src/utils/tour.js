import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const STORAGE_KEYS = {
  dashboard: 'architect_tour_dashboard_done',
  builder: 'architect_tour_builder_done',
};

export const startDashboardTour = (force = false) => {
  if (!force && localStorage.getItem(STORAGE_KEYS.dashboard)) return;

  const driverObj = driver({
    showProgress: true,
    animate: true,
    overlayColor: 'rgba(0,0,0,0.7)',
    smoothScroll: true,
    popoverClass: 'architect-tour-popover',
    nextBtnText: 'Next →',
    prevBtnText: '← Back',
    doneBtnText: 'Start Building 🚀',
    onDestroyStarted: () => {
      localStorage.setItem(STORAGE_KEYS.dashboard, 'true');
      driverObj.destroy();
    },
    steps: [
      {
        element: '#tour-welcome-banner',
        popover: {
          title: '👋 Welcome to Architect.io!',
          description: 'Design full-stack backends visually and export production-ready code in seconds. Let\'s take a 30-second tour!',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '#tour-new-project-btn',
        popover: {
          title: '🆕 Create a Project',
          description: 'Click here to start a new backend project from scratch. You\'ll get a visual canvas to design your architecture.',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '#tour-tab-templates',
        popover: {
          title: '⚡ Pre-built Templates',
          description: 'Not sure where to start? Pick from templates like E-Commerce, SaaS, or Social Media — pre-wired and ready to generate.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#tour-tab-docs',
        popover: {
          title: '📚 Documentation',
          description: 'Learn how to use every node type, connect them together, and deploy your generated backend.',
          side: 'bottom',
          align: 'start',
        },
      },
    ],
  });

  driverObj.drive();
};

export const startBuilderTour = (force = false) => {
  if (!force && localStorage.getItem(STORAGE_KEYS.builder)) return;

  const driverObj = driver({
    showProgress: true,
    animate: true,
    overlayColor: 'rgba(0,0,0,0.75)',
    smoothScroll: true,
    popoverClass: 'architect-tour-popover',
    nextBtnText: 'Next →',
    prevBtnText: '← Back',
    doneBtnText: 'Got it! 🎉',
    onDestroyStarted: () => {
      localStorage.setItem(STORAGE_KEYS.builder, 'true');
      driverObj.destroy();
    },
    steps: [
      {
        element: '#tour-node-sidebar',
        popover: {
          title: '🧱 Node Library',
          description: 'Drag any node from here onto the canvas. Nodes represent different parts of your backend: Data Models, API Routes, Auth, Schedulers, and more.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '#tour-canvas',
        popover: {
          title: '🎨 Your Architecture Canvas',
          description: 'Drop nodes here to design your backend. Connect them by dragging from one node\'s handle to another. The canvas auto-saves your work.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '#tour-core-nodes',
        popover: {
          title: '📦 Core Nodes',
          description: 'Start here! Drag a "Data Model" to define your database schema, then connect it to an "API Route" to generate CRUD endpoints automatically.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '#tour-arch-nodes',
        popover: {
          title: '🔐 Architecture Nodes',
          description: 'Add Auth Guards for JWT authentication, configure your Database connection, set up Email providers, or add Middleware like rate limiters.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '#tour-properties-panel',
        popover: {
          title: '⚙️ Properties Panel',
          description: 'Click any node on the canvas to configure its settings here. Add fields to entities, set API routes, configure auth methods, and more.',
          side: 'left',
          align: 'start',
        },
      },
      {
        element: '#tour-generate-btn',
        popover: {
          title: '🚀 Generate & Download',
          description: 'When your architecture is ready, click this button to download a complete Node.js/Express/MongoDB backend project as a zip file — ready to run!',
          side: 'bottom',
          align: 'end',
        },
      },
    ],
  });

  driverObj.drive();
};

export const resetTours = () => {
  localStorage.removeItem(STORAGE_KEYS.dashboard);
  localStorage.removeItem(STORAGE_KEYS.builder);
};
