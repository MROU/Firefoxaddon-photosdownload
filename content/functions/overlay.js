// JavaScript Document
var win=null;
var Dphoto={
	
	show:function()
	{
		
		var doc = window.getBrowser().selectedBrowser.contentDocument;
		var imageNodes=doc.getElementsByTagName("img");  
		var params={'imageNodes':imageNodes};
		
		win=this.openWindow("dphoto","chrome://dphoto/content/imagespanel.xul","chrome=yes,centerscreen", params);
		
 	},
	openWindow:function(windowName,url,flags,params)
	{
	    var windowsMediator=Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	  var aWindow = windowsMediator.getMostRecentWindow(windowName);
		 if (aWindow) { 
      aWindow.focus();
    }	  
	else
	{
	   aWindow = window.openDialog(url, windowName, flags, params);	
	}
	return aWindow;
	}
	
	
};
const COLUMNS_PER_ROW = 3;	//每行显示3张图片
function mainWindowOnLoad() {
  var params = window.arguments[0];
  var imageNodes = params['imageNodes'];
  
  displayImages(imageNodes);
}

function displayImages(imageNodes) {
	
	  
	  var COUNT_ROW=4;
	  var rows = document.getElementById("imagesContainer");
	   row = document.createElement("row"); 
	   row.setAttribute("align", "center");
	   rows.appendChild(row);
	   var count=1;
	for(var i=0;i<imageNodes.length;i++)
	{
	  
	   
	if(i<(COUNT_ROW*count))
	 {
	  
	   document.getElementById("imagenum").value=imageNodes.length;
	   hbox = document.createElement("hbox");
       hbox.setAttribute("style", "padding:5px 5px 5px 5px; width:120px;height:90px");
	   checkbox=document.createElement("checkbox");
	  
        checkbox.setAttribute("checked", "false");
		checkbox.setAttribute("imageUrl",imageNodes[i].src);
	   image = document.createElement("image");
       image.setAttribute("src",imageNodes[i].src);
	   
	   image.setAttribute("style", "width:120px;height:90px");
	   hbox.appendChild(checkbox);
       hbox.appendChild(image);
	   row.appendChild(hbox);
	   
	}
	else
	{
	   row = document.createElement("row"); 
	   row.setAttribute("align", "center");
	   rows.appendChild(row);
	   hbox = document.createElement("hbox");
       hbox.setAttribute("style", "padding:5px 5px 5px 5px; width:120px;height:90px");
	    checkbox=document.createElement("checkbox");
	   checkbox.setAttribute("checked", "false");
	   checkbox.setAttribute("imageUrl", imageNodes[i].src);
	   
       hbox.appendChild(checkbox);
	   image = document.createElement("image");
       image.setAttribute("src",imageNodes[i].src);
	   image.setAttribute("style", "width:120px;height:90px");
       hbox.appendChild(image);
	   row.appendChild(hbox);
	   count++;
	}
	
	}

	
/*  imageNodes = imageNodes || [];
  var cols = COLUMNS_PER_ROW, row, image, hbox, checkbox;
  var rows = document.getElementById("imagesContainer");
  for (var i = 0, n = imageNodes.length; i < n; i++) {
    var imageNode = imageNodes[i];
    var imageSrc = imageNode.getAttribute("src");
    if (imageSrc == "") {
      continue;
    }
    if (cols >= COLUMNS_PER_ROW) {
      row = document.createElementNS(XUL_NS, "row"); 
      row.setAttribute("align", "center");
      rows.appendChild(row);
      cols = 0;
    }
    else {
      hbox = document.createElementNS(XUL_NS, "hbox");
      hbox.setAttribute("style", "padding:5px 5px 5px 5px;");
      image = document.createElementNS(XUL_NS, "image");
      image.setAttribute("src", imageSrc);
      checkbox = document.createElementNS(XUL_NS, "checkbox");
      checkbox.setAttribute("imageUrl", imageSrc);
      hbox.appendChild(checkbox);
      hbox.appendChild(image);
      row.appendChild(hbox);
      cols++;
    }
  }*/
}

var saveDirectory="";
function selectSaveDirectory() {
	
  const nsIFilePicker = Components.interfaces.nsIFilePicker;
  var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
  fp.init(window, "", nsIFilePicker.modeGetFolder);
  var result = fp.show(); //显示目录选择对话框
  if (result == nsIFilePicker.returnOK) {
    var file = fp.file;
    saveDirectory = file;
	
	document.getElementById("save-path").value = file.path;//把目录的路径显示在文本框中
  }
}
function getDefaultSaveDirectory() {
  var file = Components.classes["@mozilla.org/file/directory_service;1"]
                .getService(Components.interfaces.nsIProperties)
                .get("Home", Components.interfaces.nsIFile);
				
		document.getElementById("save-path").value = file.path;	
  return file;
}


function downloadSingleImage(uri) {

       var appInfo=Components.classes["@mozilla.org/xre/app-info;1"]   
  
        .getService(Components.interfaces.nsIXULAppInfo);   
  
    var isOnBranch = appInfo.platformVersion.indexOf("1.8") == 0; //自动查看版本的参数  
  
  var ios = Components.classes["@mozilla.org/network/io-service;1"]
              .getService(Components.interfaces.nsIIOService);

  var imageURI = ios.newURI(uri, null, null); //创建图像的 URI

  var imageFileName = uri.substring(uri.lastIndexOf("/") + 1);

  var channel = ios.newChannelFromURI(imageURI);  //创建读取 URI 指定的数据流的通道

  var observer = {
    onStreamComplete : function(loader, context, status, length, result) {
      var file = Components.classes["@mozilla.org/file/local;1"]
                    .createInstance(Components.interfaces.nsILocalFile);
      file.initWithFile(saveDirectory);  //图片保存的目录
      file.appendRelativePath(imageFileName);
      var stream = Components.classes["@mozilla.org/network/safe-file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
      stream.init(file, -1, -1, 0);
      var bstream = Components.classes["@mozilla.org/binaryoutputstream;1"]
                      .createInstance(Components.interfaces.nsIBinaryOutputStream);
      bstream.setOutputStream(stream);        
      bstream.writeByteArray(result, length); //把图片流的全部字节写入输出文件流中
      if (stream instanceof Components.interfaces.nsISafeOutputStream) {
        stream.finish();
      } 
      else {
        stream.close();
      }
    
    }
  };
   
  var streamLoader = Components.classes["@mozilla.org/network/stream-loader;1"]
             .createInstance(Components.interfaces.nsIStreamLoader);
  if (isOnBranch) {   
  
        streamLoader.init(channel, observer, null);   
  
  
  
} else {   
  
        streamLoader.init(observer);   
  
        channel.asyncOpen(streamLoader, channel);   
  
}  
  
}
function selectedphoto()
{
	  var rows = document.getElementById("imagesContainer");
      var checkboxes =document.getElementsByTagName("checkbox");
	  var selected=document.getElementById("items").selectedItem;
	  //alert(checkboxes.length);
	  var selectval=selected.value;
	  var count=0;
	 
	
	  for (var i = 0, n = checkboxes.length; i < n; i++)
	  {
	       checkboxes.item(i).setAttribute("checked","false"); 
	  }
	  
	
	  
	 for (var i = 0, n = checkboxes.length; i < n; i++) {
		 
	       //alert(checkboxes[i].getAttribute("imageUrl").toLowerCase());
	// alert(checkboxes[i].getAttribute("imageUrl").toLowerCase().endsWith(selectval));
	 if (checkboxes[i].getAttribute("imageUrl").toLowerCase().endsWith(selectval)) {
		   
		     count++;
		     checkboxes[i].checked="true";
			 
	}
  }
   if(selectval=="all")
	   {
		 alert("亲，你选择了"+checkboxes.length+"张图片！");
		 for (var i = 0, n = checkboxes.length; i < n; i++)
	     {
	       checkboxes.item(i).setAttribute("checked","true"); 
	     } 
      }
	  else
	  {	  
         alert("亲，你选择了"+count+"张图片！");	
	  }
	 
	
}
function download() {
	
  var rows = document.getElementById("imagesContainer");
  var checkboxes = rows.getElementsByTagName("checkbox");
  var imageUrls = [];
   
  document.getElementById("download-process").style.display="block";
   
  for (var i = 0, n = checkboxes.length; i < n; i++) {
	 // alert(checkboxes[i].getAttribute("imageUrl"));
    if (checkboxes[i].checked) {
      imageUrls.push(checkboxes[i].getAttribute("imageUrl")); //用户选择的图片的 URL
    }
  }
  var total = imageUrls.length;

  for (var i=0; i <total; i++) {
     
      downloadSingleImage(imageUrls[i]);
  }

   alert("亲！下载成功， do a great job，祝你天天开心！");
    document.getElementById("download-process").style.display="none";
}
function about()
{
	
  window.open("chrome://dphoto/content/about.html","dphotoDownload","chrome=yes,centerscreen")	
}