let scene, camera, renderer,spotLight,composer;

const init = () => {
  //Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  //Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping=THREE.ReinhardToneMapping;
  renderer.toneMappingExposure=3;
  renderer.shadowMap.enabled=true;
  document.body.appendChild(renderer.domElement);

  // Camera
  const aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(35, aspect, 0.01, 1000);
  camera.position.set(0, 3, 5);

  //Camera Controls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.addEventListener('change', renderer);

  //Light
  const hemiLight = new THREE.HemisphereLight(0xffeeb1,0x080820,2);
  scene.add(hemiLight);

  spotLight = new THREE.SpotLight(0xffa95c, 4);
  spotLight.castShadow=true;
  spotLight.shadow.bias=-0.001;
  spotLight.shadow.mapSize.width=10000;
  spotLight.shadow.mapSize.height=10000;
  scene.add(spotLight);
  
  //Post Processing
  composer = new POSTPROCESSING.EffectComposer(renderer);
  composer.addPass(new POSTPROCESSING.RenderPass(scene,camera));

  const effectPass = new POSTPROCESSING.EffectPass(camera, new POSTPROCESSING.BloomEffect({
    intensity:3,
    luminanceThreshold:0.8,
    width:100,
    height:100,
  })
  );
  composer.addPass(effectPass);


  //Loader
  const loader = new THREE.GLTFLoader();
  loader.load('scene.gltf', (result) => {
    const model = result.scene.children[0];
    model.traverse(n=>{
      if (n.isMesh){
        n.castShadow=true;
        n.receiveShadow=true;
        if(n.material.map) n.material.map.anisotropy=100;
      }
    })
    scene.add(model);
    animate();
  });
};

//Recursive Loop for Render scene

const animate = () => {
  requestAnimationFrame(animate);
  spotLight.position.set(
    camera.position.x+5,
    camera.position.y+5,
    camera.position.z-5
  )
  // renderer.render(scene, camera);
  composer.render()
};

init();
