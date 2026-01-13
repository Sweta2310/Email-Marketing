import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { ensureEmailClient } from "../middleware/ensureEmailClient.js";
import {
    addContact,
    getContacts,
    getContactById,
    updateContact,
    searchContacts,
    getLists,
    createList,
    getSegments,
    createSegment,
    updateSegment,
    updateContactConsent,
    addSender,
    getSenders,
    updateSender,
    deleteSender,
    deleteContact,
    bulkAddContacts,
    addContactsToList
} from "../controllers/marketing.controller.js";

const router = express.Router();


// All marketing routes require auth and email client
router.use(protect, ensureEmailClient);

router.post("/contacts/bulk", bulkAddContacts);



router.post("/contacts", addContact);
router.get("/contacts", getContacts);
router.get("/contacts/:id", getContactById);
router.put("/contacts/:id", updateContact);
router.delete("/contacts/:id", deleteContact);
router.get("/contacts/search", searchContacts);

router.get("/lists", getLists);
router.post("/lists", createList);
router.post("/lists/:listId/contacts", addContactsToList);

router.get("/segments", getSegments);
router.post("/segments", createSegment);
router.put("/segments/:id", updateSegment);

router.patch("/contacts/:id/consent", updateContactConsent);

// Sender Routes
router.post("/senders", addSender);
router.get("/senders", getSenders);
router.put("/senders/:id", updateSender);
router.delete("/senders/:id", deleteSender);

export default router;
