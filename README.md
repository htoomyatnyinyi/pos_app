pos-app/
│
├── app/
│ ├── \_layout.tsx
│ ├── index.tsx
│ │
│ ├── (auth)/
│ │ ├── login.tsx
│ │ └── register.tsx
│ │
│ ├── (tabs)/
│ │ ├── products.tsx
│ │ ├── cart.tsx
│ │ ├── orders.tsx
│ │ └── settings.tsx
│ │
│ └── product/
│ └── [id].tsx
│
├── services/
│ ├── store/
│ │ └── store.ts
│ │
│ ├── api/
│ │ └── posApi.ts
│ │
│ ├── features/
│ │ ├── auth/
│ │ │ ├── authSlice.ts
│ │ │ └── authApi.ts
│ │ │
│ │ ├── cart/
│ │ │ └── cartSlice.ts
│ │ │
│ │ ├── products/
│ │ │ ├── productApi.ts
│ │ │ └── productTypes.ts
│ │ │
│ │ └── orders/
│ │ ├── orderApi.ts
│ │ └── orderSlice.ts
│ │
│ ├── hooks/
│ │ ├── useAppDispatch.ts
│ │ └── useAppSelector.ts
│ │
│ ├── components/
│ │ ├── ProductCard.tsx
│ │ ├── CartItem.tsx
│ │ ├── PosHeader.tsx
│ │ └── Loading.tsx
│ │
│ ├── constants/
│ │ └── colors.ts
│ │
│ ├── utils/
│ │ ├── currency.ts
│ │ └── calculateTotal.ts
│ │
│ └── types/
│ └── global.ts
│
├── assets/
│
├── package.json
├── tsconfig.json
├── app.json
└── babel.config.js
