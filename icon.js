
function setFavico(canvas) {
  const url = canvas.toDataURL('image/png')
  let icons = [...document.querySelector('head').querySelectorAll('link')]
    .filter(link => {
      const rel = link.getAttribute('rel') || ''
      return rel.indexOf('icon') > -1
    })
  if (icons.length) {
    icons.forEach(icon => icon.setAttribute('href', url))
  } else {
    const icon = document.createElement('link')
    icon.setAttribute('rel', 'icon')
    icon.setAttribute('href', url)
    document.querySelector('head').appendChild(icon)
  }
}
var DIRECTION = {
  37: 'left',
  // 上
  38: 'up',
  // 右
  39: 'right',
  // 下
  40: 'down',
}

class Snake {
  constructor() {
    // 15*15
    this.SIDE = 32 // favcion边长32px
    this.LINE_WIDTH = 1 // 1px
    this.SIZE = 3 // 一个数据点的像素值
    this.WIDTH = 10 // 游戏空间是10个  (32-2)/3
    this.score = 0
    this.max = localStorage.getItem('moyumax') || 0
    this.directions = {
      // 左
      'left': { x: -1, y: 0 },
      // 上
      'up': { x: 0, y: -1 },
      // 右
      'right': { x: 1, y: 0 },
      // 下
      'down': { x: 0, y: 1 },
    }
    this.initCanvas()
  }
  initCanvas() {
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.canvas.height = this.SIDE
    document.body.appendChild(this.canvas)
  }
  initGrid() {
    this.grid = []
    while (this.grid.length < this.WIDTH) {
      this.grid.push(new Array(this.WIDTH).fill(0))
    }
  }
  // 初始化小蛇蛇
  initSnake() {
    this.snake = []
    // 初始值长度是3 处置位置在左侧中间
    let y = 4
    let x = 0
    let snakeLength = 3
    while (snakeLength > 0) {
      this.snake.push({ x: x, y: y })
      this.grid[y][x] = '1'
      snakeLength--
      x++
    }
    // 小蛇的初始方向是右边
    this.current = this.directions.right

  }
  bindEvents() {
    // 初始是右边
    document.onkeydown = (event) => {
      // 左上右下 37383940
      let key = event.keyCode
      if (key in DIRECTION) {
        this.current = this.directions[DIRECTION[key]]
      }
    }
    this.timer = setInterval(() => {
      this.move()
    }, 170)
  }
  setTitle() {
    document.title = `[${this.score}:score][max:${this.max}]`
  }
  // 小蛇移动
  move() {
    // 1. 根据方向，计算出下一个蛇头所在位置
    // 蛇头设为
    const head = this.snake[this.snake.length - 1]
    const tail = this.snake[0]
    const nextX = head.x + this.current.x
    const nextY = head.y + this.current.y

    // 2. 判断蛇头是不是出界  是不是碰见自己个了 如果是屁股尖就碰不到
    const isOut = nextX < 0 || nextX >= this.WIDTH || nextY < 0 || nextY >= this.WIDTH
    if (isOut) {
      this.initGame()
      return
    }

    const isSelf = (this.grid[nextY][nextX]) == '1' && !(nextX === tail.x && nextY === tail.y)

    if (isSelf) {
      this.initGame()
      return
    }

    const isFood = this.grid[nextY][nextX] == '2' // 食物是2
    if (!isFood) {
      // 所谓蛇向前走，就是把尾巴去掉， 新增nextX和Y
      // 去尾巴 有食物的时候不用去尾
      this.snake.shift()
      this.grid[tail.y][tail.x] = 0
    } else {
      // 食物吃掉了，在放一个
      this.setFood()
      // 加一份
      this.score++
      this.setTitle()
    }

    // 新增头部
    this.snake.push({ x: nextX, y: nextY })
    this.grid[nextY][nextX] = '1'
    this.drawCanvas()
  }
  // 放吃的
  setFood() {
    while (true) {
      const x = Math.floor(Math.random() * this.WIDTH)
      const y = Math.floor(Math.random() * this.WIDTH)
      if (this.grid[y][x] == '1') {
        continue
      } else {
        //食物是2
        this.grid[y][x] = '2'
        break
      }
    }
  }

  drawCanvas() {
    // 32*32 四周变量1px，所以中间是30*30， 用15*15的格子，每个格子2px
    var context = this.canvas.getContext('2d')  //getContext() 方法可返回一个对象  
    context.clearRect(0, 0, this.SIDE, this.SIDE)
    context.strokeStyle = 'green'
    context.lineWidth = this.LINE_WIDTH
    context.fillStyle = "red"  // 设置或返回用于填充绘画的颜色、渐变或模式              
    context.strokeRect(0, 0, this.SIDE, this.SIDE)

    this.grid.forEach((row, y) => {
      row.forEach((g, x) => {
        if (g !== 0) {
          // 食物或者是蛇
          context.fillRect(this.LINE_WIDTH + x * this.SIZE, this.LINE_WIDTH + y * this.SIZE, this.SIZE, this.SIZE)  // x轴 y轴 宽 和 高 ,绘制“被填充”的矩形  

        }
      })
    })
    setFavico(this.canvas)
  }

  initGame() {
    if (this.score > this.max) {
      // 破纪录了
      localStorage.setItem('moyumax', this.score)
      this.max = this.score
      this.score = 0
    }
    this.setTitle()
    this.initGrid()
    this.initSnake()
    this.setFood()
    console.table(this.grid)
    this.drawCanvas()
  }
  init() {
    this.initCanvas()
    this.initGame()
    this.bindEvents()
  }

}


class Icon {
  constructor() {
    this.width = 0
    this.SIDE = 32 // favcion边长32px
    this.initCanvas()
    this.initFilterCanvas()
  }
  initCanvas() {
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.canvas.height = this.SIDE
    // document.body.appendChild(this.canvas)
  }
  initFilterCanvas() {
    this.canvasFilter = document.createElement('canvas')
    this.canvasFilter.width = this.canvasFilter.height = this.SIDE
    // document.body.appendChild(this.canvasFilter)
  }
  initVideo(url) {
    let video = document.createElement('video')
    video.width = this.width
    video.controls = "controls"
    // video.src = url || '//image.shengxinjing.cn/moyu/video/ji.mp4'
    // video.src = url || '//tatic-oss.gs-souvenir.com/web/video/pro-video/516x368.mp4'
    // video.src = url || '//assets.mixkit.co/videos/preview/mixkit-black-cat-with-yellow-eyes-1539-large.mp4'
    video.src = url || './jntm.mp4'
    video.crossOrigin = "anonymous"
    video.autoplay = "autoplay"
    video.volume = 0.5
    document.body.appendChild(video)

    this.video = video
    this.bindVideoEvents()
    this.bindKeyboardEvents()
  }
  bindKeyboardEvents() {
    const directions = {
      left: () => this.video.currentTime -= 5,
      right: () => this.video.currentTime += 5,
      up: () => this.video.volume += 0.1,
      down: () => this.video.volume -= 0.1,
    }
    document.onkeydown = (event) => {
      console.log(this.video.volume)
      // 左上右下 37 38 39 40
      let key = event.keyCode
      if (key in DIRECTION) {
        directions[DIRECTION[key]]()
      }
    }
  }
  bindVideoEvents() {
    this.video.addEventListener('timeupdate', () => {
      this.videoToImage()
      this.showProgress()
    }, false)
  }
  formatTime(second) {
    const m = Math.floor(second / 60) + ''
    const s = parseInt(second % 60) + ''
    return m.padStart(2, '0') + ":" + s.padStart(2, '0')
  }
  showProgress() {
    const current = this.video.currentTime
    const total = this.video.duration
    const per = Math.floor((current / total) * 4)
    console.log((current / total).toFixed(2))
    const p = ['🌑', '🌒', '🌓', '🌔', '🌝'][per]
    document.title = `${p}${this.formatTime(current)}/${this.formatTime(total)}`
  }
  videoToImage() {
    const context = this.canvas.getContext('2d')
    context.clearRect(0, 0, this.SIDE, this.SIDE)
    context.drawImage(this.video, 0, 0, this.SIDE, this.SIDE)
    setFavico(this.canvas)
  }
  videoToImageByFilter() {
    const context = this.canvas.getContext('2d')
    context.clearRect(0, 0, this.SIDE, this.SIDE)
    context.drawImage(this.video, 0, 0, this.SIDE, this.SIDE)

    //获取ImageData的属性：width，height，data（包含 R G B A 四个值）；
    var imgdata = context.getImageData(0, 0, this.SIDE, this.SIDE)

    // for(var i=0;i<imgdata.data.length;i += 4){
    // 灰色滤镜
    //计算获取单位元素的RBG然后取平均值 然后复制给自身得到灰色的图像
    // var avg =  (imgdata.data[i]+ imgdata.data[i+1]+ imgdata.data[i+2])/3
    // imgdata.data[i] = imgdata.data[i+1] =imgdata.data[i+2] =avg   

    // 反色滤镜
    //将所有的RGB值重新赋值（底片效果 = 255 - 当前的RGB值）
    // imgdata.data[i] =255-imgdata.data[i];
    // imgdata.data[i+1] =255-imgdata.data[i+1];
    // imgdata.data[i+2] =255-imgdata.data[i+2];

    // 黑白滤镜
    // var avg =  (imgdata.data[i]+ imgdata.data[i+1]+ imgdata.data[i+2])/3;
    // imgdata.data[i] =avg>128 ? 255 :0;
    // imgdata.data[i+1] =avg>128 ? 255 :0;
    // imgdata.data[i+2] =avg>128 ? 255 :0;

    //黄色滤镜的算法：红色通道值和绿色通道值增加50（红色+绿色 = 黄色）
    // var r = imgdata.data[i] +50;
    // var g = imgdata.data[i+1] +50
    // //注：当前值大于255时将其赋值255
    // imgdata.data[i] = r > 255 ? 255 : r;
    // imgdata.data[i+1] = g > 255 ? 255 : g;
    // }
    // 怀旧滤镜
    for (var i = 0; i < imgdata.height * imgdata.width; i++) {
      var r = imgdata.data[i * 4],
        g = imgdata.data[i * 4 + 1],
        b = imgdata.data[i * 4 + 2];

      var newR = (0.393 * r + 0.769 * g + 0.189 * b);
      var newG = (0.349 * r + 0.686 * g + 0.168 * b);
      var newB = (0.272 * r + 0.534 * g + 0.131 * b);
      var rgbArr = [newR, newG, newB].map((e) => {
        return e < 0 ? 0 : e > 255 ? 255 : e;
      });
      [imgdata.data[i * 4], imgdata.data[i * 4 + 1], imgdata.data[i * 4 + 2]] = rgbArr;
    }


    //将图像信息绘制第二个canvas中，注：一般只能在服务下运行
    this.canvasFilter.getContext('2d').putImageData(imgdata, 0, 0);
    setFavico(this.canvasFilter)
  }
  async initCam() {
    let video = document.createElement('video')
    video.width = this.width
    video.autoplay = "autoplay"
    document.body.appendChild(video)
    this.video = video
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
    this.video.srcObject = mediaStream

    this.video.addEventListener('timeupdate', () => {
      this.videoToImageByFilter()
    }, false)
  }
}

if (window.ictype === 'video') {
  // window.vurl = window.vurl||
  // 视频
  var m = new Icon()
  m.initVideo(window.vurl)
} else if (window.ictype === 'camera') {
  // 摄像头
  var m = new Icon()
  m.initCam()
} else if (window.ictype === 'snake') {
  // 贪食蛇
  var s = new Snake()
  s.init()
}







