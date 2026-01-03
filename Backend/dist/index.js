import express from "express";
import authRoutes from "./routes/auth.routes.js";
const app = express();
app.use(express.json());
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/auth', authRoutes);
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
//# sourceMappingURL=index.js.map