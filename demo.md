前几天没啥事，写了一个favicon看视频的工具，挺多小老弟喜欢， 我就又更新了几个功能,写个完整版教程把，代码放github了 https://github.com/shengxinjing/iconjs

新增功能

1. 视频进度条，上下左右控制视频音量和前进后退
2. 摄像头直播，新增了简单的怀旧滤镜🐶
3. 贪食蛇小游戏  
先看效果把
![](https://user-gold-cdn.xitu.io/2020/4/7/171535e232378110?w=259&h=102&f=gif&s=52175)
![](https://user-gold-cdn.xitu.io/2020/4/7/171535e9274ccf5a?w=259&h=110&f=gif&s=52928)
![](https://user-gold-cdn.xitu.io/2020/4/7/1715370280ecf3a0)

原理很简单，favicon上可放一个32*32的图片，我们动态修改这个图，就可以实现放视频，看摄像头和小游戏的功能，直接看下完整版代码把

## 放视频

视频功能见上个文章  https://juejin.im/post/5e86051b6fb9a03c8122b16d

## 音量和视频控制

document监听键盘事件，针对上下左右做不同的处理

```javascript
const DIRECTION = {
    37:'left',
    // 上
    38:'up',
    // 右
    39:'right',
    // 下
    40:'down',
}
```

```javascript
const directions = {
  left: ()=> this.video.currentTime-=5,
  right: ()=> this.video.currentTime+=5,
  up: ()=> this.video.volume+=0.1,
  down: ()=> this.video.volume-=0.1,
}
document.onkeydown = (event)=> {
  // 左上右下 37 38 39 40
  let key = event.keyCode
  if(key in DIRECTION){
    directions[DIRECTION[key]]()
  }
}
```

搞定


## 视频进度条

根据currentTime和duration 可以得到视频的播放事件和总时长

再根据这边文章[Animating URLs with Javascript and Emojis](https://matthewrayfield.com/articles/animating-urls-with-javascript-and-emojis/)的启发，用emoji做个图形进度条

```javascript
    formatTime(second){
        const m = Math.floor(second/60) + ''
        const s = parseInt(second%60) + ''
        return m.padStart(2,'0')+":"+s.padStart(2,'0')
    }
    showProgress(){
        const current = this.video.currentTime
        const total = this.video.duration
        const per = Math.floor((current/total)*4)
        console.log((current/total).toFixed(2))
        const p = ['🌑', '🌒', '🌓', '🌔', '🌝'][per]
        document.title = `${p}${this.formatTime(current)}/${this.formatTime(total)}`
    }
```

效果


![](https://user-gold-cdn.xitu.io/2020/4/7/171535e232378110?w=259&h=102&f=gif&s=52175)



## 摄像头

用webrtc实现很简单，好像没啥鸟用的功能，纯属娱乐  可以监控身后有没有老板
后续考虑看看加个人脸识别，识别老板 或者自己笑得过于开心，都发个提醒



```javascript
let video = document.createElement('video')
video.width=this.width
video.autoplay="autoplay"
document.body.appendChild(video)
this.video = video
const mediaStream =  await navigator.mediaDevices.getUserMedia({video:true}) // webrtc
this.video.srcObject = mediaStream

this.video.addEventListener('timeupdate',()=>{
  this.videoToImageByFilter()
},false)
```



![](https://user-gold-cdn.xitu.io/2020/4/7/171535e4cb36bc46?w=259&h=102&f=gif&s=68411)

## 滤镜

如果你用这个来直播，虽然小了点，但是也可以考虑加一个滤镜，原理也很简单，canvas获取图片像素颜色值，对需要的滤镜，找到公式设置一下就行，比如灰色滤镜，计算获取单位元素的RBG然后取平均值 然后复制给自身得到灰色的图像

```javascript
const context = this.canvas.getContext('2d')
context.clearRect(0, 0, this.SIDE, this.SIDE)
context.drawImage(this.video, 0, 0, this.SIDE, this.SIDE)

//获取ImageData的属性：width，height，data（包含 R G B A 四个值）；
var imgdata = context.getImageData(0,0,this.SIDE,this.SIDE)

for(var i=0;i<imgdata.data.length;i += 4){
  // 灰色滤镜
  // 计算获取单位元素的RBG然后取平均值 然后复制给自身得到灰色的图像
  var avg =  (imgdata.data[i]+ imgdata.data[i+1]+ imgdata.data[i+2])/3
  imgdata.data[i] = imgdata.data[i+1] =imgdata.data[i+2] =avg   
}


this.canvasFilter.getContext('2d').putImageData(imgdata,0,0);
setFavico(this.canvasFilter)
```


![](https://user-gold-cdn.xitu.io/2020/4/7/171535e69e00828e?w=259&h=110&f=gif&s=37469)

怀旧滤镜公式

![img](https://user-gold-cdn.xitu.io/2018/9/16/165e1782dee77463?imageslim)

代码呼之欲出，不要问逻辑，问就是抄公式，很多滤镜的公式baidu都可以搜到，比如卡通，熔炉，黑白等等

```javascript
// 怀旧滤镜
const context = this.canvas.getContext('2d')
context.clearRect(0, 0, this.SIDE, this.SIDE)
context.drawImage(this.video, 0, 0, this.SIDE, this.SIDE)

//获取ImageData的属性：width，height，data（包含 R G B A 四个值）；
var imgdata = context.getImageData(0,0,this.SIDE,this.SIDE)
for(var i = 0; i < imgdata.height * imgdata.width; i++) {
  var r = imgdata.data[i*4],
      g = imgdata.data[i*4+1],
      b = imgdata.data[i*4+2];

  var newR = (0.393 * r + 0.769 * g + 0.189 * b);
  var newG = (0.349 * r + 0.686 * g + 0.168 * b);
  var newB = (0.272 * r + 0.534 * g + 0.131 * b);
  var rgbArr = [newR, newG, newB].map((e) => {
    return e < 0 ? 0 : e > 255 ? 255 : e;
  });
  [imgdata.data[i*4], imgdata.data[i*4+1], imgdata.data[i*4+2]] = rgbArr;
}
this.canvasFilter.getContext('2d').putImageData(imgdata,0,0);
setFavico(this.canvasFilter)
```


![](https://user-gold-cdn.xitu.io/2020/4/7/171535e9274ccf5a?w=259&h=110&f=gif&s=52928)

看到favicon中略显忧郁的我，感觉回到了杀马特的青春岁月，可惜现在发量不行了



## 贪食蛇

其实32*32像素，还是可以实现很多有意思的功能，1px变量后，还有30px可以发挥，基本边长是2和3像素的点课件， 我们最多可以有15的边长可以发挥，比如贪食蛇，俄罗斯方块，有兴趣的可以挑战坦克大战，推箱子

话不多说，先写代码，贪食蛇原理就是canvas里坐游戏，然后渲染favicon，新建一个类

```javascript
class Snake {
	constructor(){
        // 15*15
        this.SIDE = 32 // favcion边长32px
        this.LINE_WIDTH = 1 // 1px
        this.SIZE = 3 // 一个数据点的像素值
        this.WIDTH =10 // 游戏空间是10个  (32-2)/3

        this.initCanvas()
    }
	initCanvas(){
		this.canvas = document.createElement('canvas')
        this.canvas.width = this.canvas.height = this.SIDE
    }
	initGrid(){
		this.grid = []
		while(this.grid.length<this.WIDTH){
			this.grid.push(new Array(this.WIDTH).fill(0))
		}
	}
}
```

### 初始化



新建好网格后，我们规定0是初始值，小蛇占的位置，就是1，食物是2

小蛇初始长度是3，在左侧居中，

```javascript
// 初始化小蛇蛇
initSnake(){
  this.snake = []

  // 初始值长度是3 处置位置在左侧中间
  let y = 4
  let x = 0
  let snakeLength = 3
  while(snakeLength>0){
    this.snake.push({x:x,y:y})
    this.grid[y][x] = '1'
    snakeLength--
    x++
  }
  // 小蛇的初始方向是右边
  this.current = this.directions.right
}
```

我们console.table一下this.grid

![](https://user-gold-cdn.xitu.io/2020/4/7/171535fdbede6c35?w=2020&h=480&f=png&s=58614)
bingo

### 渲染网格
我们需要把网格渲染到canvas里 先把canvas放在body里，方便调试
方法和很粗暴，只是个玩具，就不考虑渲染的优化了，直接遍历网格，每次都重新渲染即可


```javascript

initCanvas(){
	this.canvas = document.createElement('canvas')
    this.canvas.width = this.canvas.height = this.SIDE
    document.body.appendChild(this.canvas)
}

drawCanvas(){
	// 32*32 四周变量1px，所以中间是30*30， 用15*15的格子，每个格子2px
    var context = this.canvas.getContext('2d')  //getContext() 方法可返回一个对象  
    context.clearRect(0,0,this.SIDE,this.SIDE)
    context.strokeStyle = 'green'
    context.lineWidth = this.LINE_WIDTH
  	context.fillStyle = "red"  // 设置或返回用于填充绘画的颜色、渐变或模式              
	context.strokeRect(0, 0, this.SIDE, this.SIDE)
	
	this.grid.forEach((row,y)=>{
		row.forEach((g,x)=>{
			if(g!==0){
				// 食物或者是蛇
				context.fillRect(this.LINE_WIDTH+x*this.SIZE,this.LINE_WIDTH+y*this.SIZE,this.SIZE,this.SIZE)  // x轴 y轴 宽 和 高 ,绘制“被填充”的矩形  
				
			}
		})
    })
    setFavico(this.canvas)
}
```
看下效果

![](https://user-gold-cdn.xitu.io/2020/4/7/1715363625ffeffb?w=1162&h=748&f=png&s=82903)


小蛇出来了 yeah

### 放食物
这个没啥说的，随机一个坐标，然后位置落在小蛇上，就重新随机，否则就设置成2 画出来也用红色
然后直接把canvas截个图，放在favicon上就可以

```javascript
// 放吃的
setFood(){
	while(true){
		const x = Math.floor(Math.random()* this.WIDTH)
		const y = Math.floor(Math.random()* this.WIDTH)
		if(this.grid[y][x]=='1'){
			continue
		}else{
			//食物是2
			this.grid[y][x]='2'
			break
		}
	}
}

```


![](https://user-gold-cdn.xitu.io/2020/4/7/1715365c942d6e70?w=1532&h=948&f=png&s=162602)

### 移动
有上下左右四个方向可以移动，这里偷个懒 单纯的根据方向和蛇头的位置，判断下一个蛇头在的点，然后根据是否吃掉食物，决定尾巴是不是掐掉一个尖即可，比较简单
1. 下一个蛇头在的位置，如果超出网格，或者是小蛇自己，游戏结束，统计分数放在localstorage里
2. setInterval定时移动就可以，根据方向
3. 

```javascript
this.directions = {
	// 左
	'left':{x:-1,y:0},
	// 上
	'up':{x:0,y:-1},
	// 右
	'right':{x:1,y:0},
	// 下
	'down':{x:0,y:1},
}

```

```javascript
move(){	
	// 1. 根据方向，计算出下一个蛇头所在位置
	// 蛇头设为
	const head = this.snake[this.snake.length-1]
	const tail = this.snake[0]
	const nextX = head.x+this.current.x
	const nextY = head.y+this.current.y

	// 2. 判断蛇头是不是出界  是不是碰见自己个了 如果是屁股尖就碰不到
    const isOut = nextX<0||nextX>=this.WIDTH||nextY<0||nextY>=this.WIDTH
    if(isOut){
        this.initGame()
		return 
    }

	const isSelf = (this.grid[nextY][nextX]) =='1' && !(nextX === tail.x && nextY === tail.y)

	if(isSelf){
        this.initGame()
		return 
	}

    const isFood = this.grid[nextY][nextX]=='2' // 食物是2
    if(!isFood){
        // 所谓蛇向前走，就是把尾巴去掉， 新增nextX和Y
        // 去尾巴 有食物的时候不用去尾
        this.snake.shift()
        this.grid[tail.y][tail.x] = 0
    }else{
        // 食物吃掉了，在放一个
        this.setFood()
        // 加一份
        this.score++
        this.setTitle()
    }

	// 新增头部
	this.snake.push({x:nextX,y:nextY})
    this.grid[nextY][nextX] = '1'
    this.drawCanvas()
}

```


![](https://user-gold-cdn.xitu.io/2020/4/7/1715370280ecf3a0)

## 后续
基本功能也就这些了，自己摸鱼够用了，这样就可以开3个tab
* 1号tab看小视频
* 2号tab开摄像头，防止后面班主任
* 3号tab玩贪食蛇
其实30 * 30像素可以做的东西还挺多，比如俄罗斯方块，魔塔，坦克大战，都是能放下的，有兴趣的可以试试

代码地址： https://github.com/shengxinjing/iconjs
过两天把0.2的代码也录个视频放B站把，[0.1版本视频](https://www.bilibili.com/video/BV1R54116794)欢迎三连

建个群把，一起摸鱼，进不去的加我微信 `woniu_ppp`

![image-20200402232718316](https://user-gold-cdn.xitu.io/2020/4/2/1713b839260b9543?w=1001&h=1280&f=png&s=236308)