# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Description

Backend Code

## Summary

Backend code deployed with 10 features for Milestone 1:

- Admin: manage staff registration & roles
- Admin: manage vendor details
- Admin: manage vehicle parts
- Admin: create purchase invoices (stock updates)
- Staff: register customers with vehicle details
- Staff: sell parts & create sales invoices
- Staff: search customers by vehicle number, phone, ID, or name
- Staff: view customer details and history (within customer modal)
- Customer: self-register and manage profile/vehicle details
- Customer: book appointments
