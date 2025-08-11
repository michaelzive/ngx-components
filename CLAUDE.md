# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Angular 20.1 application called "ngx-components" that serves as a proof-of-concept for custom Angular components. It uses the latest Angular standalone application architecture with **zoneless change detection** (Angular v20+). The project demonstrates modern Angular patterns with signals, standalone components, and Angular Material integration.

## Development Commands

### Core Development
- `npm run start` or `ng serve` - Start development server at http://localhost:4200/
- `npm run build` or `ng build` - Build for production (outputs to `dist/`)
- `npm run watch` or `ng build --watch --configuration development` - Build in watch mode for development
- `npm run test` or `ng test` - Run unit tests with Karma

### Code Generation
- `ng generate component component-name` - Generate new component (will use SCSS by default)
- `ng generate --help` - See all available schematics

## Architecture & Structure

### Key Configuration
- **Standalone Application**: Uses new Angular standalone bootstrap approach with `bootstrapApplication()`
- **Zoneless Change Detection**: Using `provideZonelessChangeDetection()` (Angular v20+)
- **Angular Material**: v20.1.5 with CDK and animations support
- **TypeScript**: v5.8.2 with strict mode and comprehensive type checking
- **Styling**: SCSS with inline style language configuration
- **Testing**: Jasmine/Karma setup with coverage reporting
- **Build**: Angular's new application builder (`@angular/build:application`)

### Application Structure
- `src/app/app.ts` - Main standalone component (`App`) using signals (`title = signal('ngx-components')`)
- `src/app/app.config.ts` - Application configuration with zoneless change detection and providers
- `src/app/app.routes.ts` - Router configuration (currently empty)
- `src/app/sample-usage.component.ts` - Demo component showcasing custom components
- `src/app/components/` - Custom reusable components directory
- `src/styles.scss` - Global styles
- `public/` - Static assets (favicon.ico)

### Custom Components
The project includes a sophisticated drawer panel component system:

#### DrawerPanelComponent (`src/app/components/drawer-panel/`)
- **Purpose**: Resizable, dockable side panel with tabbed interface
- **Features**: 
  - Supports docking on all four sides (left, right, top, bottom)
  - Resizable with mouse/touch and keyboard controls
  - Tabbed interface with content projection
  - Signal-based reactive state management
  - Angular Material integration (sidenav, tabs, icons, buttons)
  - Accessibility support with ARIA labels and keyboard navigation
  - Two visual variants: 'default' and 'ag' (AG Grid style)
- **Architecture**: Uses OnPush change detection, signals for state, and Angular animations
- **Key Files**:
  - `drawer-panel.component.ts` - Main component with comprehensive signal-based state
  - `drawer-panel.component.html` - Template with Material components
  - `drawer-panel.component.scss` - Styling for different dock positions and variants
  - `drawer-panel-tab.directive.ts` - Directive for content projection
  - `drawer-panel.interfaces.ts` - TypeScript interfaces and configuration
  - `index.ts` - Barrel export file

### Component Patterns
- **Standalone Components**: All components use `standalone: true` with explicit `imports` arrays
- **Signal-based State**: Use Angular signals (`signal()`, `computed()`, `input()`, `output()`) for reactive state
- **Input/Output Patterns**: Use new `input()` and `output()` functions for component communication
- **Change Detection**: OnPush strategy with signal-based reactivity
- **Content Projection**: Use `<ng-content>` and custom directives for flexible component composition
- **Template Separation**: Template and style files separate from component TypeScript files
- **SCSS Styling**: Component-specific SCSS files with BEM-like naming conventions

### Dependencies & Libraries
- **Angular**: v20.1.0 (core, common, forms, router, platform-browser)
- **Angular Material**: v20.1.5 (CDK, Material components, animations)
- **RxJS**: v7.8.0 for reactive programming
- **TypeScript**: v5.8.2 with strict compilation

## TypeScript Configuration
- **Strict Mode**: Enabled with comprehensive type checking
- **Compiler Options**: ES2022 target with module preservation, isolated modules
- **Angular Compiler**: Strict templates, injection parameters, and input access modifiers
- **Project References**: Separate configs for app (`tsconfig.app.json`) and specs (`tsconfig.spec.json`)

## Build & Bundle Configuration
- **Application Builder**: Uses new `@angular/build:application` builder
- **Asset Handling**: Static assets from `public/` directory
- **Bundle Budgets**: Initial bundle warning at 500kB, error at 1MB
- **Style Processing**: SCSS compilation with inline style language support
- **Source Maps**: Enabled in development configuration