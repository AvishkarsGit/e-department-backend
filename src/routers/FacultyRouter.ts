import { Router } from 'express';
import { FacultyController } from '../controllers/FacultyController';


class FacultyRouter{
    public router:Router;

    constructor(){
    this.router=Router(); 

    this.postroutes();
    this.getroutes();
    this.deleteroutes();
    this.patchroutes();
    }

    postroutes(){
      this.router.post("/create-faculty",
        FacultyController.createFaculty
    )
    }
    getroutes(){
        this.router.get("/get-faculty",
            FacultyController.getFaculty
        )
    }
    deleteroutes(){
        this.router.delete("/delete-faculty",
            FacultyController.deleteFaculty
        )
    }
    patchroutes(){
        this.router.patch("/update-faculty",
            FacultyController.updateFaculty
        )
    }
}

export default new FacultyRouter().router;