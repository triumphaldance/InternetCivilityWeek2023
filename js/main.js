var tikuList = [];
var currenTimu = {};
var score = 0;
//是否还能继续选择
var isChoose = false;
//设置答题数量
var num = 10;
var count = 0;
var array;
// // 诗句选择
function getRandomPoem() {
  $.getJSON("json/poetry.json", function (data) {
    var poems = data.poems;
    var randomPoem = poems[Math.floor(Math.random() * poems.length)];
    var poemContent = randomPoem.content;
    var poetryContent = document.getElementById("poetry-content");
    poetryContent.textContent = '"' + poemContent + '"';
  });
}
getRandomPoem();
//获取登录者的信息
function getParameterByName(name) {
  var urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}
// 获取username和studentID参数的值
var usernameParam = getParameterByName("username");
var studentIDParam = getParameterByName("studentID");
// 在控制台打印参数的值
// console.log("username:", usernameParam);
// console.log("studentID:", studentIDParam);
//ajax获取题目内容
$.get("json/data.json", function (res) {
  //用了jquery相当于res = JSON.parse(res.responseText)
  //自动获取响应数据以字符串形式返回，不用自己多写这一句
//   console.log(res);
  //把获取到的所有数据放入数组中
  tikuList = res;
});
//点击开始答题按钮切换页面
$(".startBtn").click(function (e) {
  if (count >= 3) {
    alert("您的答题次数已经3次了");
  } else {
    $(".gaming").addClass("active");
    $(".startGame").removeClass("active");
    //每次点击随机出个题目并显示在页面上
    randomRender();
    // 获取开始时间戳
    var startTime = Date.now();
    // 存储开始时间戳，以备后续使用
    sessionStorage.setItem("startTime", startTime);
  }
});
function randomRender() {
  //获取题库数组中，随机出的整数(pasetInt)索引值		parseInt方法       返回由字符串转换得到的整数。
  var randomIndex = parseInt(Math.random() * tikuList.length);
  //每次拿出一个题目放到一个对象里，并把这个题目从数组中删除
  //这个题目对象是一个数组，所以写个0获取当前对象
  currentTimu = tikuList.splice(randomIndex, 1)[0];
//   console.log(currentTimu);
  //获取页面标签题目，并把对象字符串中的quiz（题目）设置显示在页面上
  $(".timu").html(currentTimu.qu);
  //每次执行清空一次
  $(".options").html("");
  currentTimu.options.forEach(function (item, index) {
    $(".options").append(
      `<div data-index="${index}">${index + 1}.${item}</div>`
    );
  });
}
//选项的点击事件
$(".options").click(function (e) {
  if (e.target.dataset.index) {
    if (!isChoose) {
      //把索引值转成数字		parseInt方法       返回由字符串转换得到的整数。
      var index = parseInt(e.target.dataset.index);
    //   console.log(index + 1);
      //题目中的index是0开始,answer是1开始,所以要加一
      //若答案与点击按钮的索引一致
      if (currentTimu.answer == index + 1) {
        score += 10;
        //把获取的索引添加正确的背景颜色
        $("[data-index=" + index + "]").addClass("correct");
      } else {
        var corectindex = currentTimu.answer - 1;
        //若点击的索引不对,把正确的背景颜色和错误的背景颜色都显示出来
        $("[data-index=" + corectindex + "]").addClass("correct");
        $("[data-index=" + index + "]").addClass("error");
      }
      isChoose = true;
      //每点击一次,答题的数量减1
      num--;
      //延迟一秒进行切换
      setTimeout(function () {
        //答题数量结束了,切换到结束页面,否则切换到下一题
        if (num == 0) {
          // var count =getQuizCount();
          // saveQuizCount(count);
          $(".endGame").addClass("active");
          //获取得分标签,把上面累计的得分设置显示到页面上
          $(".score").html(score);
          // 获取开始时间戳和结束时间戳
          var startTime = parseInt(sessionStorage.getItem("startTime"));
          var endTime = Date.now();
          // 将开始、结束时间格式化为年月日时分秒的形式
          var startDateTime = new Date(startTime).toLocaleString();
          var endDateTime = new Date(endTime).toLocaleString();
          // 计算答题时间（毫秒）
          var duration = endTime - startTime;
          // 将答题时间转换为秒
          var durationInSeconds = Math.floor(duration / 1000);
        //   console.log("答题时间（秒）:", durationInSeconds);
          // 将答题时间转换为时分秒的形式
          var durationFormatted = formatDuration(duration);
        //   console.log("答题时间（时:分:秒）:", durationFormatted);
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
            duration: durationInSeconds,
          };
          // 发送POST请求给后端Flask
          $.ajax({
            // url: "/userpoint", // 替换为你的Flask后端的URL端点
            url: "http://zekee.top:8081/userpoint",
            method: "POST",
            data: JSON.stringify(data),
            dataType: "json",
            contentType: "application/json",
            success: function (response) {
              // 请求成功的回调函数
            //   console.log("数据发送成功");
            //   console.log("后端返回的响应:", response);
              var rank = response.rank;
              rank.sort((a, b) => {
                if (a.score === b.score) {
                  return a.duration - b.duration; // 如果得分相同，按持续时间升序排序
                } else {
                  return b.score - a.score; // 按得分降序排序
                }
              });
              // 提取前三名的数据
              var topThree = rank.slice(0, 3).map((item) => {
                return { name: item.username, score: item.score };
              });
              var rankingData = {
                topThree: topThree,
                currentScore: score,
                currentRank: response.nowRank,
              };
              var rankingTable = document.querySelector(".ranking");
              var tbody = rankingTable.querySelector("tbody");

              // 插入前三名的排名和分数
              rankingData.topThree.forEach(function (participant, index) {
                var row = document.createElement("tr");
                var rankCell = document.createElement("td");
                var nameCell = document.createElement("td");
                var scoreCell = document.createElement("td");
                rankCell.textContent = index + 1;
                nameCell.textContent = participant.name;
                scoreCell.textContent = participant.score;
                row.appendChild(rankCell);
                row.appendChild(nameCell);
                row.appendChild(scoreCell);
                tbody.appendChild(row);
              });
              // 插入当前答题者的分数和排名
              var currentScoreElement = document.querySelector(".score");
              currentScoreElement.textContent = rankingData.currentScore;
              var currentRankRow = document.createElement("tr");
              var currentRankCell = document.createElement("td");
              currentRankCell.colSpan = 3;
              currentRankCell.textContent =
                "您的排名：第" + rankingData.currentRank + "名";
              currentRankRow.appendChild(currentRankCell);
              tbody.appendChild(currentRankRow);
              // 在此处可以进行其他处理，例如显示成功信息给用户
            },
            error: function (error) {
              // 请求失败的回调函数
            //   console.log("数据发送失败");
            //   console.log("错误信息:", error);
              // 在此处可以进行错误处理，例如显示错误信息给用户
            },
          });
          // 重新刷新页面进行重新答题
        } else {
          isChoose = false;
          randomRender();
        }
      }, 1000);
    }
  }
});
//点击重新答题按钮后,重新刷新页面进行重新答题， ajax向后端传usernameParam，studentIDParam和score三个值
$(".reStart").click(function () {
  if (count < 3) {
    location.reload();
    // console.log("答题次数：" + count);
  } else {
    alert("您的答题次数已经3次了");
    // console.log(count);
  }
});
function formatDuration(duration) {
  var seconds = Math.floor(duration / 1000);
  var hours = Math.floor(seconds / 3600);
  var minutes = Math.floor((seconds % 3600) / 60);
  seconds = seconds % 60;
  return (
    hours.toString().padStart(2, "0") +
    ":" +
    minutes.toString().padStart(2, "0") +
    ":" +
    seconds.toString().padStart(2, "0")
  );
}
//阻止页面滑动
document.addEventListener(
  "touchmove",
  function (event) {
    event.preventDefault();
  },
  { passive: false }
);
//页面响应式
$(document).ready(function () {
  $.ajax({
    // url: "/userpoint", // 替换为你的Flask后端的URL端点
    url: "http://zekee.top:8081/getCount",
    method: "GET",
    data: { studentID: studentIDParam },
    // dataType: "json",
    // contentType: "application/json",
    success: function (response) {
      // 请求成功的回调函数
      // console.log("数据发送成功");
    //   console.log(response);
      count = response.count;
      $(".quizCount").text("您的答题次数为：" + count + "次");
      // 在此处可以进行其他处理，例如显示成功信息给用户
    },
    error: function (error) {
      // 请求失败的回调函数
      // console.log("数据发送失败");
      // console.warn(error);
      // 在此处可以进行错误处理，例如显示错误信息给用户
    },
  });
  const windowWidth = Math.floor($(window).width());
  $(".page").css("transform", `translateX(${windowWidth}px)`);
  $(".page").width(`${windowWidth}`);
  if (windowWidth < 819) {
    $(".text").css({
      right: windowWidth / 12 + "px",
      left: windowWidth / 12 + "px",
    });
  }
  if (windowWidth > 735) {
    var paddingValue = "40px " + windowWidth / 4 + "px";
    $(".gaming").css("padding", paddingValue);
  } else {
    var paddingValue = "40px " + "20px " + "40px " + "40px";
    $(".gaming").css("padding", paddingValue);
  }
});
$(window).resize(() => {
  const windowWidth = Math.floor($(window).width());
  $(".page").css("transform", `translateX(${windowWidth}px)`);
  $(".page").width(`${windowWidth}`);
  if (windowWidth < 819) {
    $(".text").css({
      right: windowWidth / 12 + "px",
      left: windowWidth / 12 + "px",
    });
  }
  if (windowWidth > 735) {
    var paddingValue = "40px " + windowWidth / 4 + "px";
    $(".gaming").css("padding", paddingValue);
  } else {
    var paddingValue = "40px " + "20px " + "40px " + "40px";
    $(".gaming").css("padding", paddingValue);
  }
//   console.log(windowWidth);
});
