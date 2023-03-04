// 常驻的页面，它的生命周期是插件中所有类型页面中最长的；
// 它随着浏览器的打开而打开，随着浏览器的关闭而关闭，
// 所以通常把需要一直运行的、启动就运行的、全局的代码放在background里面。




// chrome.contextMenus.create({
//     id: "1",
//     title: "Help Crawel",
//     contexts: ["all"],
//   });




//将element与selector相关联后的数据格式为map
  let elements= ["Title","Authors","File","Tags","Content","Area",
  "Audio","CategoryID","CityISO","CommentCount","CrawlTime","Description",
  "DislikeCount","Education","Email","ExpertWebsite","FacebookID","FavoriteCount",
  "Footnote","Host","ID","Footnote","CityISO","Content","File","CategoryText",
  "Image","InstagramID","Keywords","Language","LikeCount","Link","LinkedInID",
  "Location","LocationCityISO","Name","NationalityCityISO","PageType","Phone",
  "PublicationTime","RepostCount","SubContext","SubTitle","Tags","Title",
  "TwitterID","Type","URL","Video","ViewCount","Index","New","Report","Export"];
  //"Index","New","Report","Export"此三个为跳转的

  //将常用的放在右键菜单上1.0版  2.0版将可以自定义常用属性
  let normalElement = ["Title", "Authors", "Content",
  "Description", "Link",
  "PublicationTime", "New", "Report", "Export", "Index"]


// chrome.tabs.getSelected(null,function(tab){
//   alert(tab.url)
// })


// background访问popup上则通过`extension.getViews`来访问
// let views=extension.getViews({type:"popup"});

//监听元素变化？？

