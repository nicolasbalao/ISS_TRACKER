import {BufferGeometry, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, SphereGeometry} from "three";
import {MathUtils} from "./MathUtils.js";
import {CONFIG} from "../config/config.js";

export class GroundReferenceMarker {
    constructor(scene) {
        this.scene = scene;
        this.marker = null;
        this.connectionLine = null;

        this.createMarker();
    }

    createMarker(){
       const geometry = new SphereGeometry(0.005, 16, 16);
       const material = new MeshBasicMaterial({ color:  CONFIG.SCENE.ISS_GROUND_REFERENCE.COLOR, transparent: true, opacity: 0.3 });

       this.marker = new Mesh(geometry, material);
       this.marker.visible = true;
       this.scene.add(this.marker);
    }

    createConnectionLine(issPosition){
        if(this.connectionLine){
            this.scene.remove(this.connectionLine);
        }

        const geometry = new BufferGeometry().setFromPoints([
            this.marker.position,
            issPosition
        ]);

        const material = new LineBasicMaterial({
            color:  CONFIG.SCENE.ISS_GROUND_REFERENCE.COLOR,
            transparent: true,
            opacity: 0.3
        })

        this.connectionLine = new Line(geometry, material);
        this.scene.add(this.connectionLine)
    }

    updatePosition(position) {
        if(!position || !this.marker) {
            return;
        }

        const surfaceHeight  = CONFIG.SCENE.EARTH_RADIUS + CONFIG.SCENE.ISS_GROUND_REFERENCE.HEIGHT_OFFSET;

        const vector3Position =  MathUtils.convertLatLonToVector3D(position.lat, position.lon, surfaceHeight);
        this.marker.position.copy(vector3Position);
    }

    dispose(){
        if(this.marker) {
            this.scene.remove(this.marker);
            this.marker.geometry.dispose();
            this.marker.material.dispose();
            this.marker = null;
        }
    }

}