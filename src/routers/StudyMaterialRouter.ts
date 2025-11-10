import { Router } from "express";
import { StudyMaterialController } from "../controllers/StudyMaterialController";
import { UtilsofStudy } from "../utils/Utils";
import { StudyMaterialValidator } from "../validators/StudymaterialValidator";

const studyUpload = new UtilsofStudy();

class DocumentationRouter{
 public router : Router;
 constructor(){
    this.router=Router();
    this.getRouters();
    this.deleteRouters();
    this.patchRouters();
    this.postRouters();
    
 }
//getroutes
 getRouters(){
  this.router.get('/get-studymaterial',
   StudyMaterialController.getStudyMaterial
  )
 }

 //create routes
 postRouters(){
   this.router.post('/create-studymaterial',
   studyUpload.multer.single("attachment"),
   StudyMaterialValidator.addStudyMaterial(),
   StudyMaterialController.createStudyMaterial
  )
 }

 // edit routes
 patchRouters(){
  this.router.patch('/update-studymaterial/:id',
   studyUpload.multer.single("attachment"),
   StudyMaterialValidator.updateStudyMaterial(),
   StudyMaterialController.updateStudyMaterial
  )
 }

 // delete routes
 deleteRouters(){
  this.router.delete('/delete-studymaterial/:id',
   StudyMaterialController.deleteStudyMaterial
  )
 }
}

export default new DocumentationRouter().router;

