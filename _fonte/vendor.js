import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import Matter from 'matter-js';
import Lenis from 'lenis';
window.V = { THREE, GLTFLoader, MeshoptDecoder, RoomEnvironment, Matter, Lenis };
