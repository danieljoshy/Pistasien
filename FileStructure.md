pistasien/
│
├── frontend/
│   ├── pages/
│   │   ├── index.html
│   │   ├── auth.html
│   │   ├── mens.html
│   │   ├── product.html
│   │   ├── cart.html
│   │   ├── checkout.html
│   │   ├── wishlist.html
│   │   ├── profile.html
│   │   └── admin.html
│   │
│   ├── css/
│   │   ├── style.css
│   │   ├── auth.css
│   │   ├── mens.css
│   │   ├── product.css
│   │   ├── cart.css
│   │   └── admin.css
│   │
│   ├── js/
│   │   ├── main.js
│   │   ├── auth.js
│   │   ├── mens.js
│   │   ├── product.js
│   │   ├── cart.js
│   │   ├── admin.js
│   │   └── api.js
│   │
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── vercel.json
│   └── favicon.ico
│
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   │
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Cart.js
│   │   │   └── Order.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── cartController.js
│   │   │   └── orderController.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── cartRoutes.js
│   │   │   └── orderRoutes.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   │
│   │   └── utils/
│   │       └── generateToken.js
│   │
│   ├── .env
│   ├── package.json
│   └── uploads/
│
├── database/
│   └── MongoDB
│
└── README.md