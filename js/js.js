var tikuList = [];
var currenTimu = {};
var score = 0;
//是否还能继续选择
var isChoose = false;
//设置答题数量
var num = 1;

// 诗句选择
function getRandomPoem() {
	// 异步请求 JSON 文件
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'json/poetry.json', true);
	xhr.onreadystatechange = function() {
	  if (xhr.readyState === 4 && xhr.status === 200) {
		var data = JSON.parse(xhr.responseText);
		var poems = data.poems;
		var randomPoem = poems[Math.floor(Math.random() * poems.length)];
		var poemContent = randomPoem.content;
		var poetryContent = document.getElementById('poetry-content');
		poetryContent.textContent = '"' + poemContent + '"';
	  }
	};
	xhr.send();
  }
  getRandomPoem();
//获取登录者的信息
function getParameterByName(name) {
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(location.search);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  // 获取username和studentID参数的值
  var usernameParam = getParameterByName('username');
  var studentIDParam = getParameterByName('studentID');

  // 在控制台打印参数的值
  console.log('username:', usernameParam);
  console.log('studentID:', studentIDParam);



//ajax获取题目内容
$.get("json/data.json",function(res){
	//用了jquery相当于res = JSON.parse(res.responseText)
	//自动获取响应数据以字符串形式返回，不用自己多写这一句
	console.log(res)
	//把获取到的所有数据放入数组中
	tikuList = res
})

//点击开始答题按钮切换页面
$(".startBtn").click(function(e){
	$(".gaming").addClass("active")
	$(".startGame").removeClass("active")
	//每次点击随机出个题目并显示在页面上
	randomRender()
	// 获取开始时间戳
    var startTime = Date.now();
    // 存储开始时间戳，以备后续使用
    sessionStorage.setItem('startTime', startTime);

})

function randomRender(){
	//获取题库数组中，随机出的整数(pasetInt)索引值		parseInt方法       返回由字符串转换得到的整数。
	var randomIndex = parseInt(Math.random()*tikuList.length);
	//每次拿出一个题目放到一个对象里，并把这个题目从数组中删除
	//这个题目对象是一个数组，所以写个0获取当前对象
	currentTimu = tikuList.splice(randomIndex,1)[0];
	console.log(currentTimu);
	//获取页面标签题目，并把对象字符串中的quiz（题目）设置显示在页面上
	$(".timu").html(currentTimu.qu);
	//每次执行清空一次
	$(".options").html("");
	//遍历题目对象字符串中的选择options内容           	   内容        索引
	currentTimu.options.forEach(function(item,index){
		$(".options").append(`<div data-index="${index}">${index+1}.${item}</div>`)
	})
	
		
}

//选项的点击事件
$(".options").click(function(e){
	if(!isChoose){
		//把索引值转成数字		parseInt方法       返回由字符串转换得到的整数。
		var index = parseInt(e.target.dataset.index);
		console.log(index+1);
		//题目中的index是0开始,answer是1开始,所以要加一
		//若答案与点击按钮的索引一致
		if(currentTimu.answer==(index+1)){
			score += 10;
			//把获取的索引添加正确的背景颜色
			$("[data-index="+index+"]").addClass("correct")
		}else{
			var corectindex = currentTimu.answer-1;
			//若点击的索引不对,把正确的背景颜色和错误的背景颜色都显示出来
			$("[data-index="+corectindex+"]").addClass("correct")
			$("[data-index="+index+"]").addClass("error")
		}
		
		isChoose = true;
		
		//每点击一次,答题的数量减1
		num --;
		
		
		//延迟一秒进行切换
		setTimeout(function(){
			//答题数量结束了,切换到结束页面,否则切换到下一题
			if(num==0){
				$(".endGame").addClass("active")
				//获取得分标签,把上面累计的得分设置显示到页面上
				$(".score").html(score);
				// 获取开始时间戳和结束时间戳
				var startTime = parseInt(sessionStorage.getItem('startTime'));
				var endTime = Date.now();
				// 将开始、结束时间格式化为年月日时分秒的形式
				var startDateTime = new Date(startTime).toLocaleString();
				var endDateTime = new Date(endTime).toLocaleString();
				// 计算答题时间（毫秒）
				var duration = endTime - startTime;
				// 将答题时间转换为秒
				var durationInSeconds = Math.floor(duration / 1000);
				console.log('答题时间（秒）:', durationInSeconds);
				// 将答题时间转换为时分秒的形式
				var durationFormatted = formatDuration(duration);
				console.log('答题时间（时:分:秒）:', durationFormatted);
				// 渲染开始、结束时间和答题时间到页面上的相应元素
				$("#endDateTime").text(endDateTime);
				$("#duration").text(durationFormatted);
				$("#startDateTime").text(startDateTime);
				//答题结束开始向后端发起post请求
				// 构造要发送的数据对象
				var data = {
					username: usernameParam,
					studentID: studentIDParam,
					score: score,
					duration: durationInSeconds
				};
			
				// 发送POST请求给后端Flask
				$.ajax({
					// url: "/userpoint", // 替换为你的Flask后端的URL端点
					url: 'http://127.0.0.1:5000/userpoint',
					method: "POST",
					data: JSON.stringify(data),
					dataType: "json",
 					contentType: "application/json",
					success: function(response) {
						// 请求成功的回调函数
						console.log("数据发送成功");
						console.log("后端返回的响应:", response);
						// 在此处可以进行其他处理，例如显示成功信息给用户
					},
					error: function(error) {
						// 请求失败的回调函数
						console.log("数据发送失败");
						console.log("错误信息:", error);
						// 在此处可以进行错误处理，例如显示错误信息给用户
					}
				});
			
				// 重新刷新页面进行重新答题
			}else{
				isChoose = false;
				randomRender()
			}
		},1000)
	}
	
})

//点击重新答题按钮后,重新刷新页面进行重新答题
// $(".reStart").click(function(){
// 	//location.reload()	DOM方法	刷新页面
// 	location.reload()
// })

//点击重新答题按钮后,重新刷新页面进行重新答题， ajax向后端传usernameParam，studentIDParam和score三个值
$(".reStart").click(function(){
	//重新重新开始获取开始时间戳
	var startTime = parseInt(sessionStorage.getItem('startTime'));
    
    location.reload();
});
function formatDuration(duration) {
    var seconds = Math.floor(duration / 1000);
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    seconds = seconds % 60;
    return hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
};








