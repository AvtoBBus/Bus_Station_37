import { Router } from "express";
import {
    addItem,
    getItems,
    moveItem,
    switchSelected
} from "../controllers/Items";

const router = Router();

/**
 * @openapi
 * /items:
 *   get:
 *     summary: Получение элементов частями
 *     parameters:
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         required: true
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         required: true
 *       - in: query
 *         name: selected
 *         schema:
 *           type: boolean
 *           default: false
 *         required: true
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *     responses:
 *       200:
 *         description: Часть элементов
 */
router.get('/items', getItems);

/**
 * @openapi
 * /switchSelected:
 *   get:
 *     summary: Изменение состояния выбора элемента
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *           default: 1
 *         required: false
 *     responses:
 *       204:
 *         description: Успешное изменение
 */
router.get('/switchSelected', switchSelected);

/**
 * @openapi
 * /moveItem:
 *   post:
 *     summary: Переместить элемент
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *             properties:
 *               itemId:
 *                 type: string
 *                 example: 42
 *               targetBeforeId:
 *                 type: string
 *                 example: 41
 *                 nullable: true
 *               targetAfterId:
 *                 type: string
 *                 example: 43
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Успешный поиск
 */
router.post('/moveItem', moveItem);

/**
 * @openapi
 * /addItem:
 *   post:
 *     summary: Добавить элемент
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 example: "abc"
 *     responses:
 *       204:
 *         description: Успешное добавление
 */
router.post('/addItem', addItem);

export { router };