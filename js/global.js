var orthoCamera, staticCamera, carCamera, lifeCamera;
var currentCamera;
var gameScene, renderer, lifeScene;
var clock;
var car, butter_array, orange_array, table, cheerio_array, track, candle_array, sun;

// Objects dimentions:
const TABLE_Y = 300;
const TABLE_X = 400;
const TABLE_Z = 2;

const ORANGE_RADIUS = 16;

const BUTTER_X = 6;
const BUTTER_Y = 8;
const BUTTER_Z = 3;

const CHEERIO_RADIUS = 2;
const CHEERIO_TUBE = 1;

// Ortho camera dimentions:
// To make sure the camera "sees" the whole table, and a little more (5%) up, down and over the sides;
// These don't really represent camera's width and height, but instead only half of each.
const MIN_ORTHO_CAMERA_WIDTH  = (TABLE_X/2)*1.05;
const MIN_ORTHO_CAMERA_HEIGHT = (TABLE_Y/2)*1.05;


// Objects' movements:
// Acceleration generated by pressing up or down arrows.
// The higher this value, the faster the car goes.
const CAR_ACCELERATION = 520;

//The rate at which the car turns when the side keys are pressed.
const CAR_ANGULAR_SPEED = .04;

// The friction coefficient between the car and the floor.
// The higher this value, the longer it takes from the car to reach it's
// maximum speed, and the lower the maximum speed is.
const CAR_FRICTION_COEFFICIENT = 4;


const ORANGE_MAX_VELOCITY = 30;
const ORANGE_MIN_VELOCITY = 10;

const ORANGE_MAX_REAPPEAR_TIME = 15;
const ORANGE_MIN_REAPPEAR_TIME = 3;

// How often the speed increases. Every X seconds.
const ORANGE_SPEED_INCREMENT_TIME_INT = 10;

// How much the speed increases relatively to previous speed
const ORANGE_SPEED_INCREMENT = 10;


const CHEERIO_FRICTION_COEFFICIENT = 4;

// gameElements:
// Geometries:
var table_top_geometry = new THREE.BoxGeometry(TABLE_X, TABLE_Y, TABLE_Z, 120, 90);
var cheerio_geometry = new THREE.TorusGeometry(CHEERIO_RADIUS, CHEERIO_TUBE, 5, 10);
var orange_geometry = new THREE.SphereGeometry(ORANGE_RADIUS, 16, 16);
var stalk_geometry = new THREE.BoxGeometry(2, 2, 3);
var leaf_geometry = new THREE.ConeGeometry(1, 6, 12);
var butter_geometry = new THREE.CubeGeometry(BUTTER_X, BUTTER_Y, BUTTER_Z, 5, 5, 5);
butter_geometry.mergeVertices();
butter_geometry.computeVertexNormals();


var tablecloth_texture = new THREE.TextureLoader().load( "textures/mini-tablecloth.png" );
tablecloth_texture.wrapS = tablecloth_texture.wrapT = THREE.RepeatWrapping;

tablecloth_texture.offset.set( 0, 0 );
tablecloth_texture.repeat.set( 16, 12 );

// Materials:
var default_b_material = new THREE.MeshBasicMaterial({color: 0xFFFFFF, wireframe:false});
var default_p_material = new THREE.MeshPhongMaterial({color: 0xFFFFFF, shininess: 100, wireframe:false});
var default_g_material = new THREE.MeshLambertMaterial({color: 0xFFFFFF, wireframe:false});

var table_top_b_material = new THREE.MeshBasicMaterial({/*color: 0x3D1600,*/ wireframe:false, map: tablecloth_texture});
var table_top_p_material = new THREE.MeshPhongMaterial({/*color: 0x3D1600,*/ wireframe:false, shininess: 0, map: tablecloth_texture});
var table_top_g_material = new THREE.MeshLambertMaterial({/*color: 0x3D1600,*/ wireframe:false, map: tablecloth_texture});

var cheerio_b_material = new THREE.MeshBasicMaterial({color: 0xEDBA43, wireframe:false});
var cheerio_p_material = new THREE.MeshPhongMaterial({color: 0xEDBA43, shininess: 0, wireframe:false});
var cheerio_g_material = new THREE.MeshLambertMaterial({color: 0xEDBA43, wireframe:false});

var orange_b_material = new THREE.MeshBasicMaterial({color: 0xFFA500, wireframe: false});
var orange_p_material = new THREE.MeshPhongMaterial({color: 0xFFA500, shininess: 0, wireframe: false});
var orange_g_material = new THREE.MeshLambertMaterial({color: 0xFFA500, wireframe: false});

var stalk_material = new  THREE.MeshPhongMaterial({color: 0x068704, wireframe: false});

var butter_b_material = new THREE.MeshBasicMaterial({color: 0xF3EF7D, wireframe: false});
var butter_p_material = new THREE.MeshPhongMaterial({color: 0xF3EF7D, shininess: 100, specular: 0xffffff, wireframe: false});
var butter_g_material = new THREE.MeshLambertMaterial({color: 0xF3EF7D, wireframe: false});

var car_main_b_material = new THREE.MeshBasicMaterial({color:0x0061ff, wireframe:false});
var car_main_p_material = new THREE.MeshPhongMaterial({color:0x0061ff, shininess: 10, specular: 0x484848, wireframe:false});
var car_main_g_material = new THREE.MeshLambertMaterial({color:0x0061ff, wireframe:false});

var car_spoiler_b_material = new THREE.MeshBasicMaterial({color:0xFDCA40, wireframe:false});
var car_spoiler_p_material = new THREE.MeshPhongMaterial({color:0xFDCA40, shininess: 10, specular: 0x484848, wireframe:false});
var car_spoiler_g_material = new THREE.MeshLambertMaterial({color:0xFDCA40, wireframe:false});

var cockpit_b_material = new THREE.MeshBasicMaterial({color:0x3e3e3e, wireframe:false});
var cockpit_p_material = new THREE.MeshPhongMaterial({color:0x3e3e3e, shininess: 30, specular: 0x2d2d2d, wireframe:false});
var cockpit_g_material = new THREE.MeshLambertMaterial({color:0x3e3e3e, wireframe:false});

var wheels_b_material = new THREE.MeshBasicMaterial({color:0x274029, wireframe:false});
var wheels_p_material = new THREE.MeshPhongMaterial({color:0x274029, shininess: 0, wireframe:false});
var wheels_g_material = new THREE.MeshLambertMaterial({color:0x274029, wireframe:false});

// Info elements:
var pause_geometry = new THREE.PlaneGeometry(TABLE_Y, TABLE_Y);
var pause_texture = new THREE.TextureLoader().load( "textures/pauseMap.png" );
var pause_material = new THREE.MeshBasicMaterial({transparent: true, map: pause_texture});
var pause_mesh = new THREE.Mesh(pause_geometry, pause_material);

var game_over_geometry = new THREE.PlaneGeometry(TABLE_Y, TABLE_Y);
var game_over_texture = new THREE.TextureLoader().load( "textures/gameOverMap.png" );
var game_over_material = new THREE.MeshBasicMaterial({transparent: true, map: game_over_texture});
var game_over_mesh = new THREE.Mesh(game_over_geometry, game_over_material);


var all_materials = [ default_b_material,
                      default_p_material,
                      default_g_material,
                      table_top_b_material,
                      table_top_p_material,
                      table_top_g_material,
                      cheerio_b_material,
                      cheerio_p_material,
                      cheerio_g_material,
                      orange_b_material,
                      orange_p_material,
                      orange_g_material,
                      stalk_material,
                      butter_b_material,
                      butter_p_material,
                      butter_g_material,
                      car_main_b_material,
                      car_main_p_material,
                      car_main_g_material,
                      car_spoiler_b_material,
                      car_spoiler_p_material,
                      car_spoiler_g_material,
                      cockpit_b_material,
                      cockpit_p_material,
                      cockpit_g_material,
                      wheels_b_material,
                      wheels_p_material,
                      wheels_g_material
];