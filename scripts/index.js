/**
 * 定义DMS 主页的相关信息
 */
var dmsIndex = function() {
	
	var menus;
	var handles;
	var systemParams;
	
	
	/*
	 * 获取操作url
	 * 
	 */
	
	 
	function handelButtonAcl(container){	
		$("a[data-validateUrl]",container).each(function(i){
		   var url =$(this).attr("data-validateUrl");
		   if(url){
		    	var flag = true;
				$.each(handles,function(h,handle){			
					var reg = new RegExp();
					reg.compile(handle.code);	
					if(url.match(reg)){
					   flag = false;
					   return false;
					}
				});
				if(flag){
					$(this).remove();
				}
		  };	
	   });
	};
							
						
	/**
	 * 显示菜单
	 */
	
	
	var showMenus  = function () {
		
		         
		$("#menus").children(".nav-item").remove();
		dmsCommon.ajaxRestRequest({
			url : dmsCommon.getDmsPath()["web"] + "/common/login/menus",
			type : 'GET',
			sucessCallBack : function(data) {
				menus = data;
				$.each(data, function(i, menuOneObj) {
					appendHtml(menuOneObj);
					if (menuOneObj.children) {
						var twoMenu = menuOneObj.children;
						$.each(twoMenu, function(i, menuTwoObj) {
							appendHtml(menuTwoObj);
							if (menuTwoObj.children) {
								var threeMenu = menuTwoObj.children;
								$.each(threeMenu, function(i, menuThreeObj) {
									appendHtml(menuThreeObj);
								});
							}
						});
					}
				});
				// 触发click 操作
				$("li.start a").click();
			}
		});
		
		//获取操作href
		dmsCommon.ajaxRestRequest({
			url : dmsCommon.getDmsPath()["web"] + "/common/login/handles",
			type : 'GET',
			sucessCallBack : function(data) {
				handles = data;	
			}
		});
		
	};
	
	/**
	 * 根据menuId 获得菜单信息
	 */
	function getMenuInfoById(menuId){
		var findResult = {};
		//进行递归查找
		getMenuObjById(menus,menuId,-1,findResult);
		var menuNameArray = new Array();
		$.each(findResult,function(index,menu){
			menuNameArray.push(menu.menuName);
		});
		return menuNameArray;
	};
	
	/**
	 * 
	 */
	function changeActiveFunc(menuId){
		changeActiveMenuClass(menuId);
		changeFuncCacheData(menuId);
//		var menuNameArray = getMenuInfoById(menuId);
//		console.log(menuNameArray);
//		//改变菜单
//		dmsCommon.showPageBar(menuNameArray);
//		
//		$("#dmsPageContent").data("dmsFuncId",menuId);
	}
	
	
	function changeFuncCacheData(menuId){
		//还原查询条件
		$("#dmsPageContent").removeData("memorySearchData");
		$("#dmsPageContent").removeData("memoryDefaultSearchData");
		//TODO after remove
		$("#dmsPageContent").data("dmsFuncId",menuId);
	}
	/**
	 * 改变活动菜单
	 */
	function changeActiveMenuClass(menuId){
		var menuContainer = $('.page-sidebar ul');
		menuContainer.children('li.active').removeClass('active');
        menuContainer.children('arrow.open').removeClass('open');
        
        $("li[id='"+menuId+"'] > a.ajaxify",menuContainer).parents('li').each(function () {
            $(this).addClass('active');
            $(this).children('a > span.arrow').addClass('open');
        });
        $("li[id='"+menuId+"'] > a.ajaxify",menuContainer).parents('li').addClass('active');
	}
	
	/**
	 * 查找对应的菜单信息
	 */
	function getMenuObjById(menuArray,menuId,loopTime,findResult){
		loopTime++;
		$.each(menuArray,function(k,searchMenu){
			if(findResult.result!=undefined){
				return false;
			}
			//进行循环
			if(searchMenu.children){
				//标识结果
				findResult[loopTime] = searchMenu;
				//进行循环
				getMenuObjById(searchMenu.children,menuId,loopTime,findResult);
			}else{
				if(searchMenu.menuId==(menuId+"")){
					findResult.result = searchMenu;
					return false;
				}
			}
		});
	}
	
	function appendHtml(Obj){
		if(Obj.menuType==1001){
			if(Obj.menuUrl){
				$("#menus").append("<li id='"+Obj.menuId+"' class='nav-item start'><a href="+Obj.menuUrl
						+" class=\"nav-link ajaxify\"> <i class='"+Obj.menuIcon+"'>" +
						"</i><span class=\"title\">"+Obj.menuName+"</span><span class=\"arrow\"></span></a>" +
								"<ul id="+Obj.menuId+" class=\"sub-menu\"></ul></li>");
			}else{
				$("#menus").append("<li class=\"nav-item\">" +
						"<a href=javascript:; class=\"nav-link nav-toggle\"> <i class='"+Obj.menuIcon+"'>" +
						"</i><span class=\"title\">"+Obj.menuName+"</span><span class=\"arrow\"></span></a>" +
								"<ul id="+Obj.menuId+" class=\"sub-menu\"></ul></li>");
			}
		}
		if(Obj.menuType==1002){
			if(Obj.menuUrl){
				$("ul[id='"+Obj.parentId+"']").append(
						"<li id="+Obj.menuId+" class=\"nav-item\"><a href="+Obj.menuUrl+" class=\"nav-link ajaxify\">" 
						+"<i class='"+Obj.menuIcon+"'></i>"+Obj.menuName+"</span><span class=\"arrow\"></span></a>" +
								"<ul id="+Obj.menuId+" class=\"sub-menu\"></ul></li>"); 
			}else{
				$("ul[id='"+Obj.parentId+"']").append(
						"<li class=\"nav-item\"><a href=javascript:; class=\"nav-link nav-toggle\">" 
						+"<i class='"+Obj.menuIcon+"'></i>"+Obj.menuName+"</span><span class=\"arrow\"></span></a>" +
								"<ul id="+Obj.menuId+" class=\"sub-menu\"></ul></li>");
			}
		}
		if(Obj.menuType==1003){
			if(Obj.menuUrl){
				$("ul[id='"+Obj.parentId+"']").append("<li id="+Obj.menuId+" class=\"nav-item\"><a href="+Obj.menuUrl+" class=\"nav-link ajaxify\">" 
						+"<i class='"+Obj.menuIcon+"'></i>"+Obj.menuName+"</a></li>"); 
			}else{
				$("ul[id='"+Obj.parentId+"']").append("<li id="+Obj.menuId+" class=\"nav-item\"><a href=javascript:; class=\"nav-link nav-toggle\">" 
						+"<i class='"+Obj.menuIcon+"'></i>"+Obj.menuName+"</a></li>");
			}
		}
	};
	
	
			
	
	/**
	 * 加载主页的html 页面
	 */
	var loadIndexHtml = function(){
		var needsLoadDev = $("div[data-need-url]");
	 	if (needsLoadDev.size() > 0) {
	 		needsLoadDev.each(function() {
	 			var url = $(this).attr("data-need-url");
	 			var container = $(this);
	 			dmsCommon.ajaxPageRequest({
		        	url:url,
		        	container:container,//定义容器
		        	complete:function(xmlRequest, statusCode){
		        		//初始化操作
		                dmsValidate.init(container);
		        	}
		        });
	         });
	     }
	};
	
	/**
	 * 展示多语言选项
	 */
	var showI18nChoice = function(){
		var cookieLanguage = $.cookie('language');
		var userBrowerInfo = App.getUserBrowerInfo();
		var useLanguage = !cookieLanguage ? userBrowerInfo.browserLanguage : cookieLanguage;
		if("zh_CN" == useLanguage){
		 	$("#pageLanguage").text("English");
		 	$("#pageLanguage").attr("language",useLanguage);
		 	$("#pageLanguage").attr("nextLanguage","en_US");
		 	
		 	//加载中文的js 文件
		 	loadjscssfile("../assets/global/plugins/bootstrap-datepicker/locales/bootstrap-datepicker.zh-CN.min.js","js");
		 	loadjscssfile("../assets/global/plugins/bootstrap-datetimepicker/js/locales/bootstrap-datetimepicker.zh-CN.js","js");
		 	loadjscssfile("../assets/global/plugins/boostrap-table/locale/bootstrap-table-zh-CN.min.js","js");
		 	loadjscssfile("../assets/global/plugins/bootstrap-fileinput/locales/zh.js","js");
		 	loadjscssfile("../assets/global/plugins/bootstrap-select/js/i18n/defaults-zh_CN.min.js","js");
//		 	loadjscssfile("../assets/global/plugins/jquery-validation/js/localization/messages_zh.js","js");
		 	
		}else{
		 	$("#pageLanguage").text("中文");
		 	$("#pageLanguage").attr("language",useLanguage);
		 	$("#pageLanguage").attr("nextLanguage","zh_CN");
		 	//加载英文的css 文件
		 	loadjscssfile("../assets/layouts/layout/css/custom_en.css","css");

		 	if ($.i18n != undefined) {
		 		jQuery.i18n.properties({
		 			name: "lang", //资源文件名称
		 			path: "../assets/global/i18n/", //资源文件路径
		 			mode: "map", //用Map的方式使用资源文件中的值
		 			language: "en",
		 			debug: false,
		 			callback: function() {
		 				//加载成功后设置显示
		 				dmsCommon.setPageLanguage(useLanguage);
//		 				dmsCommon.tip({status:"success",msg:"多语言加载完成"});
		 			}
		 		});
		 	}
	 	}
		$.cookie('language', useLanguage, { expires: 365, path: dmsCommon.getDmsPath()["root"] });
	}
	
	/**
	 * 加载css文件或是js 文件
	 */
	var loadjscssfile = function (filename,filetype){
		var fileref;
	    if(filetype == "js"){
	        fileref = document.createElement('script');
	        fileref.setAttribute("type","text/javascript");
	        fileref.setAttribute("src",filename);
	    }else if(filetype == "css"){
	    
	        fileref = document.createElement('link');
	        fileref.setAttribute("rel","stylesheet");
	        fileref.setAttribute("type","text/css");
	        fileref.setAttribute("href",filename);
	    }
	    
	   if(typeof fileref != undefined){
	        document.getElementsByTagName("head")[0].appendChild(fileref);
	    }
	}
	
	/**
	 * 页面头初始化
	 */
	var pageHeaderInit = function(){
		showI18nChoice();
		//初始化界面的信息
    	initIndexPageHtml();
	}
	/**
	 * 绑定window 窗口事件
	 */
	var bindWindowEvent = function(){
		$(window).on("resize",function () {
			Layout.fixContentHeight();
		});
	}
	
	/**
	 *根据初始化数据加载首页的信息
	 */
	var initIndexPageHtml = function(){
		var commonDataMap = dmsCommon.getCommonData();
		//初始化数据
		$("#dmsHeaderUserName",$("#dmsHeaderContent")).html($("#dmsHeaderUserName").html().format(commonDataMap));
	}
	
	/**
	 * 主页初始化
	 */
	var init = function(){
		dmsCommon.initSystemData();
		loadIndexHtml();
	}
	
	return {
		init:function(){
			init();
		},
		pageHeaderInit:function(){
			pageHeaderInit();
		},		
		showMenus:function(){
			showMenus();
		},
		showI18nChoice:function(){
			showI18nChoice();
		},
		loadjscssfile:function(filename,filetype){
			loadjscssfile(filename,filetype);
		},
		initIndexPageHtml:function(commonDataMap){
			initIndexPageHtml(commonDataMap);
		},
		getMenuInfoById:function(menuId){
			return getMenuInfoById(menuId);
		},
		changeActiveFunc:function(menuId){
			changeActiveFunc(menuId);
		},
		changeActiveMenuClass:function(menuId){
			changeActiveMenuClass(menuId);
		},
		changeFuncCacheData:function(menuId){
			changeFuncCacheData(menuId);
		},
		handelButtonAcl:function(container){
			handelButtonAcl(container);
		}
		
	};
}();
