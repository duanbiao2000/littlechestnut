let scene, camera, renderer, spotLight, composer;

const init = () => {
  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // 设置色调映射算法为 ReinhardToneMapping
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = 3;
  // 启用阴影映射
  renderer.shadowMap.enabled = true;
  // 将渲染器的 DOM 元素添加到 body 中
  document.body.appendChild(renderer.domElement);

  // 创建相机
  const aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(35, aspect, 0.01, 1000);
  camera.position.set(0, 3, 5);

  // 相机控制器
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.addEventListener('change', renderer);

  // 环境光
  const hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 2);
  scene.add(hemiLight);

  // 聚光灯
  spotLight = new THREE.SpotLight(0xffa95c, 4);
  // 启用聚光灯投射阴影
  spotLight.castShadow = true;
  // 设置聚光灯的偏移量
  spotLight.shadow.bias = -0.001;
  // 设置聚光灯投影贴图的大小
  spotLight.shadow.mapSize.width = 10000;
  spotLight.shadow.mapSize.height = 10000;
  scene.add(spotLight);

  // 后期处理
  composer = new POSTPROCESSING.EffectComposer(renderer);
  // 添加渲染通道到后期处理器
  composer.addPass(new POSTPROCESSING.RenderPass(scene, camera));
  // 创建 Bloom 效果通道
  const effectPass = new POSTPROCESSING.EffectPass(
    camera,
    new POSTPROCESSING.BloomEffect({
      intensity: 3,
      luminanceThreshold: 0.8,
      width: 100,
      height: 100,
    })
  );

  // 添加 Bloom 效果通道到后期处理器
  composer.addPass(effectPass);

  // 模型加载
  const loader = new THREE.GLTFLoader();
  loader.load('scene.gltf', (result) => {
    // 获取加载的模型
    const model = result.scene.children[0];

    // 遍历模型的子节点
    model.traverse((n) => {
      if (n.isMesh) {
        // 设置模型的阴影属性和纹理属性
        n.castShadow = true;
        n.receiveShadow = true;
        if (n.material.map) n.material.map.anisotropy = 100;
      }
    });

    // 将模型添加到场景中
    scene.add(model);

    // 启动动画循环
    animate();
  });
};

// 递归循环渲染场景
const animate = () => {
  requestAnimationFrame(animate);

  // 设置聚光灯的位置
  spotLight.position.set(
    camera.position.x + 5,
    camera.position.y + 5,
    camera.position.z - 5
  );

  // 渲染场景
  composer.render();
};

// 初始化函数调用
init();
