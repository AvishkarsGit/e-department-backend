import { Router } from "express";
import { ChatController } from "../controllers/ChatController";

class ChatRouter {
  public router: Router;
  constructor() {
    this.router = Router();
    this.getRoutes();
    this.postRoutes();
    this.putRoutes();
    this.patchRoutes();
    this.deleteRoutes();
  }

  getRoutes() {}
  postRoutes() {
    //chat router
    this.router.post("/generate", ChatController.createChat);
  }
  putRoutes() {}
  patchRoutes() {}
  deleteRoutes() {}
}

export default new ChatRouter().router;
