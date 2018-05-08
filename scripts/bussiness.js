/**
 * 整车模块相关功能
 */
var dmsVehicle = function() {
	// 创建车辆配置数据结构
	var createModelConfigStructure = function(configList){
		var rsItems = {}, rsValueItems = {};
		var _t = configList.length;
		$.each(configList, function(i, item){
			var rsParentCode = item["RS_PARENT_CODE"];
			var rsSonCode = item["RS_SON_CODE"];
			var rsSonId = item["RS_SON_ID"];
			var isDefault = item["IS_DEFAULT"];
			var isCombine = item["IS_COMBINE"];
			var quantity = item["QUANTITY"];
			var price = item["PRICE"];
			var level = item["LEV"];
			var symbol = item["SYMBOL"];
			var descId = item["DESC_ID"];
			var rsSonName = item["RS_SON_NAME"];
			var rsItemCode = item["RS_ITEM_CODE"];
			var rsItemName = item["RS_ITEM_NAME"];
			var isEmpty = item["IS_EMPTY"];
			var type = item["ITEM_TYPE"];
			var orderNo = item["ORDER_NUM"];
			
			/*
			 * 封装配置选项
			 */
			var rsValueFO = {
				"id" : rsSonId,
				"code" : rsSonCode,
				"name" : rsSonName,
				"descId" : descId,
				"price" : price,
				"isDefault" : isDefault,
				"isCombine" : isCombine,
				"rsItemCode" : rsItemCode,
				"level" : level,
				"symbol" : symbol
			}
			if(rsSonCode){
				rsValueItems[rsSonCode] = orderNo+"_"+rsItemCode;
			}
			
			if(level == 1){
				var rsItemFO = rsItems[orderNo+"_"+rsItemCode];
				if(!rsItemFO){
					rsItemFO = {
						'code' : rsItemCode,
						'name' : rsItemName,
						'type' : type,
						'quantity' : quantity,
						'orderNo' : orderNo,
						'isEmpty' : isEmpty,
						'level' : level
					}
				}
				if(rsSonCode){
					rsItemFO['rsValues'] = rsItemFO['rsValues'] || {};
					rsItemFO['rsValues'][rsSonCode] = rsValueFO;
				}
				rsItems[orderNo+"_"+rsItemCode] = rsItemFO;
			}else{
				if(!rsValueItems[rsParentCode]){
					for(var j=i+1;j<_t;j++){
						var _item = configList[j];
						var _rsSonId = _item["RS_SON_ID"];
						var _rsSonCode = _item["RS_SON_CODE"];
						var _isDefault = _item["IS_DEFAULT"];
						var _isCombine = _item["IS_COMBINE"];
						var _quantity = _item["QUANTITY"];
						var _price = _item["PRICE"];
						var _descId = _item["DESC_ID"];
						var _rsSonName = _item["RS_SON_NAME"];
						var _rsItemCode = _item["RS_ITEM_CODE"];
						var _rsItemName = _item["RS_ITEM_NAME"];
						var _orderNo = _item["ORDER_NUM"];
						var _isEmpty = _item["IS_EMPTY"];
						var _type = _item["ITEM_TYPE"];
						var _level = _item["LEV"];
						if(rsParentCode == _rsSonCode){
							rsValueItems[_rsSonCode] = _orderNo+"_"+_rsItemCode;
							var parentItemFO = {
								'code' : rsItemCode,
								'name' : rsItemName,
								'type' : type,
								'quantity' : quantity,
								'orderNo' : orderNo,
								'isEmpty' : isEmpty,
								'level' : level,
								"rsValues" : {
									_rsSonCode : {
										"id" : _rsSonId,
										"code" : _rsSonCode,
										"name" : _rsSonName,
										"descId" : _descId,
										"price" : _price,
										"isDefault" : _isDefault,
										"isCombine" : _isCombine,
										"rsItemCode" : _rsItemCode,
										"level" : level,
										"symbol" : symbol
									}
								}
							};
							rsItems[_orderNo+"_"+_rsItemCode] = parentItemFO;
							break;
						}
					}
					var sonItemFO = {
						"code" : rsItemCode,
						"name" : rsItemName,
						"orderNo" : orderNo,
						"quantity" : quantity,
						"level" : level,
						"type" : type,
						"isEmpty" : isEmpty,
						"rsValues" : {}
					}
					sonItemFO["rsValues"][rsSonCode] = rsValueFO;
					/*
					 * 判断一级配置项是否能找到？
					 * 找不到一级配置项的情况，将其作为一级配置项
					 */
					if(parentItemFO){
						var childMap = {};
						childMap[orderNo+"_"+rsItemCode] = sonItemFO;
						parentItemFO["childRsItems"] = childMap;
						rsItems[parentItemFO["orderNo"]+"_"+parentItemFO["code"]] = parentItemFO;
					}else{
						if(rsItems[orderNo+"_"+rsItemCode]){
							var rsItemFO = rsItems[orderNo+"_"+rsItemCode];
							rsValues = rsItemFO["rsValues"];
							if(rsSonCode){
								rsValues[rsSonCode] = rsValueFO;
								rsItemFO["rsValues"] = rsValues;
								rsItems[orderNo+"_"+rsItemCode] = rsItemFO;
							}
						}else{
							rsItems[orderNo+"_"+rsItemCode] = sonItemFO;
						}
					}
				}else{
					/*
					 * 如果父配置项已存在，向配置项添加子配置项
					 * 判断子配置项是否已存在
					 * 如果子配置项已存在，向子配置项添加配置选项
					 * 如果子配置项不存在，创建子配置项，同时向子配置项添加配置选项
					 */
					var parentItemCode = rsValueItems[rsParentCode];
					var parentItemFO = rsItems[parentItemCode];
					var childMap = parentItemFO["childRsItems"];
					/*
					 * 判断父配置项是否有子配置项
					 */
					if(!childMap){
						childMap = {};
						var sonItemFO = {
							"code" : rsItemCode,
							"name" : rsItemName,
							"orderNo" : orderNo,
							"quantity" : quantity,
							"level" : level,
							"type" : type,
							"isEmpty" : isEmpty,
							"rsValues" : {}
						};
						sonItemFO["rsValues"][rsSonCode] = rsValueFO;
						childMap[orderNo+"_"+rsItemCode] = sonItemFO;
						parentItemFO["childRsItems"] = childMap;
						rsItems[parentItemCode] = parentItemFO;
					}else{
						/*
						 * 判断该子配置项是否已存在
						 */
						var sonItemFO = childMap[orderNo+"_"+rsItemCode];
						if(!sonItemFO){
							sonItemFO = {
								"code" : rsItemCode,
								"name" : rsItemName,
								"quantity" : quantity,
								"orderNo" : orderNo,
								"level" : level,
								"type" : type,
								"isEmpty" : isEmpty,
								"rsValues" : {}
							};
							sonItemFO["rsValues"][rsSonCode] = rsValueFO;
							childMap[orderNo+"_"+rsItemCode] = sonItemFO;
							parentItemFO["childRsItems"] = childMap;
							rsItems[parentItemCode] = parentItemFO;
						}else{
							rsValues = sonItemFO["rsValues"];
							rsValues[rsSonCode] = rsValueFO;
							sonItemFO["rsValues"] = rsValues;
							childMap[orderNo+"_"+rsItemCode] = sonItemFO;
							parentItemFO["childRsItems"] = childMap;
							rsItems[parentItemCode] = parentItemFO;
						}
					}
				}
			}
		});
		return rsItems;
	};
	
	//通用常量
	var commonOptions = {
		//配置项
		modelConfig : {
			configTableID : 'configTable',
			rsItemTableID : 'rsItemTable',
			modelCodeID : 'rsModelCode',
			itemSumPriceID : 'matchPrice',	
			itemSelectValue : 'itemNames',
			itemSelectCode : 'itemValues',
			itemSelectName : 'itemCodes',
			itemPricesName : 'itemPrices',
			itemDataTag : '_configItem',
			itemTmpData : '_itemTmpData'
		}
	}
	
	//增加无子嗣的父级配置项的方法
	var addParentItemRow = function (panel, item){
		var itemCode = item.code;
		var itemName = item.name;
		var isEmpty = item.isEmpty;
		var rsValues = item.rsValues;
		var op = commonOptions.modelConfig;
		var isDetailFlag = panel.parents(".dms-edit:first").attr("data-isDetailFlag");
		var _selReadonly = "";			//下拉框只读标识
		var level = '1';
		var isRequiredCss = "";
//		if({'901':true,'922':true}[itemCode] || false){
//			isRequiredCss = 'required';
//		}
		if('10041001' == isEmpty){
			isRequiredCss = 'required';
		}
		var htmlStr = '<div class="col-xs-12 col-sm-6 col-md-4"><div class="form-group">';
		if(isDetailFlag&&isDetailFlag=="true" || itemCode == "901" || itemCode == "969" || itemCode == "952" || itemCode == "951"){//
			htmlStr += '<label class="control-label col-xs-4">'+itemName+'</label>'
			if(isDetailFlag&&isDetailFlag=="true")
				_selReadonly = "disabled";
		}else{
			htmlStr += '<label class="control-label col-xs-4"><a name="itemValueBtn" data-beforeShowEvent="true" data-url="common/itemValuesQueryDialog.html" data-width="modal-lg" data-toggle="modal"> <i class="fa fa-plus-square"></i> '+itemName+'</a></label>'
		}
		htmlStr	+=  '<div class="col-xs-6">'
			+ '<input id="'+op.itemSelectName+'_'+level+'_'+itemCode+'" name="'+op.itemSelectName+'" value="'+itemCode+'" type="hidden" />'
			+ '<select id="'+op.itemSelectCode+'_'+level+'_'+itemCode+'" name="'+op.itemSelectCode+'" class="bs-select form-control '+isRequiredCss+'" '+_selReadonly+'></select>'
			+ '</div>'
			+ '<div class="col-xs-2">'
			+ '<input id="'+op.itemPricesName+'_'+level+'_'+itemCode+'" name="'+op.itemPricesName+'" class="form-control digitsMinus" readonly type="text" value="" />'
			+ '</div></div></div>';
		var htmlObj = $(htmlStr);
		var selObj = htmlObj.find('select');
		selObj.data(op.itemDataTag, item);
		var btnObj = htmlObj.find('a:first');
		btnObj.data("pageData", {"itemType":"2","orderType":"1","topItemCode":itemCode,"topItemValueCode":op.itemSelectCode+'_'+level+'_'+itemCode,"topItemValueName":op.itemSelectValue+'_'+level+'_'+itemCode,
			"topItemPriceCode":op.itemPricesName+'_'+level+'_'+itemCode,'level':level});
		panel.append(htmlObj);
		addSelectOption(panel, itemCode, rsValues);
		$(selObj).selectpicker('refresh');
//		dmsDict.initObject(selObj);
	};
	
	//增加配置项的方法
	var addItemConfigRowTD = function (panel, item){
		var itemCode = item.code;
		var itemName = item.name;
		var isEmpty = item.isEmpty;
		var rsValues = item.rsValues;
		var op = commonOptions.modelConfig;
		var isDetailFlag = panel.parents(".dms-edit:first").attr("data-isDetailFlag");
		
		var level = '1';
		var isRequiredCss = "";
//		if({'401':true}[itemCode] || false){
//			isRequiredCss = 'required';
//		}
		if('10041001' == isEmpty){
			isRequiredCss = 'required';
		}
		var htmlStr = '<div class="col-xs-12 col-sm-6 col-md-4"><div class="form-group">';
		if(isDetailFlag&&isDetailFlag=="true"){
			htmlStr += '<label class="control-label col-xs-4">'+itemName+'</label>'
			_selReadonly = 'disabled';
		}else{
			htmlStr += '<label class="control-label col-xs-4"><a name="itemValueBtn" data-beforeShowEvent="true" data-url="common/itemValuesQueryDialog.html" data-width="modal-lg" data-toggle="modal"> <i class="fa fa-plus-square"></i> '+itemName+'</a></label>'
		}
		htmlStr += '<div class="col-xs-6">'
			+ '<input id="'+op.itemSelectName+'_'+level+'_'+itemCode+'" name="'+op.itemSelectName+'" value="'+itemCode+'" type="hidden" />'
			+ '<input id="'+op.itemSelectCode+'_'+level+'_'+itemCode+'" name="'+op.itemSelectCode+'" class="form-control '+isRequiredCss+'" readonly type="text" value="" />'
			+ '<input id="'+op.itemSelectValue+'_'+level+'_'+itemCode+'" name="'+op.itemSelectValue+'" type="hidden" value="" />'
			+ '</div>'
			+ '<div class="col-xs-2">'
			+ '<input id="'+op.itemPricesName+'_'+level+'_'+itemCode+'" name="'+op.itemPricesName+'" class="form-control digitsMinus" readonly type="text" value="" />'
			+ '</div></div></div>';
		var htmlObj = $(htmlStr);
		var selObj = htmlObj.find('input[name="'+op.itemSelectCode+'"]');
		selObj.data(op.itemDataTag, item);
		var btnObj = htmlObj.find('a:first');
		btnObj.data("pageData", {"itemType":"1","orderType":"1","topItemCode":itemCode,"topItemValueCode":op.itemSelectCode+'_'+level+'_'+itemCode,
				"topItemValueName":op.itemSelectValue+'_'+level+'_'+itemCode,"topItemPriceCode":op.itemPricesName+'_'+level+'_'+itemCode,'level':level});
		panel.append(htmlObj);
	};
	
	//添加有子嗣的父级配置项的方法
	var addParentItemWithSubItemRow = function (panel, item){
		var itemCode = item.code;
		var itemName = item.name;
		var isEmpty = item.isEmpty;
		var childRsItems = item.childRsItems;
		var rsValues = item.rsValues;
		var op = commonOptions.modelConfig;
		var isDetailFlag = panel.parents(".dms-edit:first").attr("data-isDetailFlag");
		var _selReadonly = "";			//下拉框只读标识
		var level = '1';
		var isRequiredCss = "";
//		if({'110':true}[itemCode] || false){
//			isRequiredCss = 'required';
//		}
		if('10041001' == isEmpty){
			isRequiredCss = 'required';
		}
		var htmlStr = '<div class="col-xs-12 col-sm-12 col-md-12"><div class="panel panel-default">'
			+ '<div class="panel-body"><div class="row" id="'+op.rsItemTableID+'">'
			+ '<div class="col-xs-12"><div class="form-group">';
		if(isDetailFlag && isDetailFlag=="true"){// || itemCode == "901" || itemCode == "969" || itemCode == "952" || itemCode == "951"
			htmlStr += '<label class="control-label col-xs-1">'+itemName+'</label>'
			_selReadonly = "disabled";
		}else{
			htmlStr += '<label class="control-label col-xs-1"><a name="itemValueBtn" data-beforeShowEvent="true" data-url="common/itemValuesQueryDialog.html" data-width="modal-lg" data-toggle="modal"> <i class="fa fa-plus-square"></i> '+itemName+'</a></label>'
		}
		htmlStr	+= '<div class="col-xs-10">'
			+ '<input id="'+op.itemSelectName+'_'+level+'_'+itemCode+'" name="'+op.itemSelectName+'" value="'+itemCode+'" type="hidden" />'
			+ '<select id="'+op.itemSelectCode+'_'+level+'_'+itemCode+'" name="'+op.itemSelectCode+'" class="bs-select form-control '+isRequiredCss+'" '+_selReadonly+'></select>'
			+ '</div>'
			+ '<div class="col-xs-1">'
			+ '<input id="'+op.itemPricesName+'_'+level+'_'+itemCode+'" name="'+op.itemPricesName+'" class="form-control digitsMinus" readonly type="text" value="" />'
			+ '</div></div></div>'
			+ '</div></div></div></div>';
		var htmlObj = $(htmlStr);
		var selObj = htmlObj.find('select');
		selObj.data(op.itemDataTag, item);
		var btnObj = htmlObj.find('a:first');
		btnObj.data("pageData", {"itemType":"3","orderType":"1","topItemCode":'DH1_110' == itemCode ? itemCode.replace('DH1_',''):itemCode,
				"topItemValueCode":op.itemSelectCode+'_'+level+'_'+itemCode,"topItemValueName":op.itemSelectValue+'_'+level+'_'+itemCode,
				"topItemPriceCode":op.itemPricesName+'_'+level+'_'+itemCode,"level":level
				});
		panel.append(htmlObj);
		addSelectOption(panel, itemCode, rsValues);
		$(selObj).selectpicker('refresh');
//		dmsDict.initObject(selObj);
		
		//创建子级配置项DOM
		addSubItem(panel, childRsItems);
	};
	
	//增加子级配置项的方法
	var addSubItem = function (panel, childRsItems){
		var level ='2';
		for(var key in childRsItems){
			var item = childRsItems[key];
			var itemCode = item.code;
			var itemName = item.name;
			var rsValues = item.rsValues;
		    var isEmpty = item.isEmpty;
			var op = commonOptions.modelConfig;
			var isDetailFlag = panel.parents(".dms-edit:first").attr("data-isDetailFlag");
			var _selReadonly = "";			//下拉框只读标识
			var isRequiredCss = "";
			if('10041001' == isEmpty){
				isRequiredCss = 'required';
			}
			var htmlStr = '<div class="col-xs-12 col-sm-6 col-md-4"><div class="form-group">';
			if((isDetailFlag&&isDetailFlag=="true") || itemCode == '110' || itemCode == '157'){// || itemCode == "901" || itemCode == "969" || itemCode == "952" || itemCode == "951"
				htmlStr += '<label class="control-label col-xs-4">'+itemName+'</label>'
				if(isDetailFlag&&isDetailFlag=="true")
					_selReadonly = "disabled";
			}else{
				htmlStr += '<label class="control-label col-xs-4"><a name="itemValueBtn" data-beforeShowEvent="true" data-url="common/itemValuesQueryDialog.html" data-width="modal-lg" data-toggle="modal"> <i class="fa fa-plus-square"></i> '+itemName+'</a></label>'
			}
			htmlStr	+= '<div class="col-xs-6">'
				+ '<input id="'+op.itemSelectName+'_'+level+'_'+itemCode+'" name="'+op.itemSelectName+'" value="'+itemCode+'" type="hidden" />'
				+ '<select id="'+op.itemSelectCode+'_'+level+'_'+itemCode+'" name="'+op.itemSelectCode+'" class="bs-select form-control '+ isRequiredCss +'" '+_selReadonly+'></select>'
				+ '</div>'
				+ '<div class="col-xs-2">'
				+ '<input id="'+op.itemPricesName+'_'+level+'_'+itemCode+'" name="'+op.itemPricesName+'" class="form-control digitsMinus" readonly type="text" value="" />'
				+ '</div></div></div>';
			var htmlObj = $(htmlStr);
			var selObj = htmlObj.find('select');
			selObj.data(op.itemDataTag, item);
			var btnObj = htmlObj.find('a:first');
			btnObj.data("pageData", {"itemType":"4","orderType":"1","topItemCode":itemCode,"topItemValueCode":op.itemSelectCode+'_'+level+'_'+itemCode,
				"topItemValueName":op.itemSelectValue+'_'+level+'_'+itemCode,"topItemPriceCode":op.itemPricesName+'_'+level+'_'+itemCode,'level':level});
			panel.find('#'+op.rsItemTableID).append(htmlObj);
			addSelectOption(panel, itemCode, rsValues);
			$(selObj).selectpicker('refresh');
//			dmsDict.initObject(selObj);
		}
	};
	
	//向配置项中添加配置选项，默认项选中
	var addSelectOption = function (panel, itemCode, rsValues){
		var op = commonOptions.modelConfig;
		var hasDKCode = false;
		var hasDefault = false;
		var select = null;
		for(var key in rsValues){
			var rsValue = rsValues[key];
			var rsItemCode = rsValue.rsItemCode;
			var rsValueId = rsValue.id;
			var rsValueCode = rsValue.code;
			var rsValueName = rsValue.name;
			var isDefault = rsValue.isDefault;
			var descId = rsValue.descId;
			var price = rsValue.price;
			var level = rsValue.level;
			var symbol = rsValue.symbol;
	
			select = panel.find('select#' + op.itemSelectCode+"_"+level+"_"+rsItemCode);
			
			if('-'!=symbol){
				select.append("<option title='"+rsValueName+"' value='"+rsValueCode+"' valueId='"+rsValueId+"' descId='"+descId+"'>"+rsValueName+"</option>");
				//如果是默认选项，选中默认选项，同时设置配置项价格
				if(null != isDefault && '10041001' == isDefault){
					var oldValue;
					var itemTmpData = select.data(op.itemTmpData);
					if(itemTmpData && itemTmpData['rsValueCode']){
						oldValue = itemTmpData['rsValueCode'];
					}
					//将选中的值存储在下拉框的数据源中
					select.data(op.itemTmpData, {'descId':descId,'rsValueCode':rsValueCode})
					select.selectpicker('refresh').selectpicker('val', rsValueCode);
//					select.find('option:last').attr("selected", true);
					panel.find('input#' + op.itemPricesName+"_"+level+"_"+rsItemCode).val(price);
					hasDefault = true || hasDefault;
					if(oldValue){
						//添加其他级联操作
						doWithValueChangeCascade(itemCode,descId,rsValueCode,rsValueName);
					}
				}
				if(rsValueCode.substr(0,2)=='DK'){
					hasDKCode = hasDKCode || true;
				}
			}
		}
		if(!hasDKCode){
			if(select == null || select.length < 1){
				select = panel.find("#"+op.itemSelectCode+"_1_"+itemCode);
			}
		}
		if(!hasDefault){
			if(select == null || select.length < 1){
				select = panel.find("#"+op.itemSelectCode+"_1_"+itemCode);
			}
			select.append("<option value='-1'>-----------------------</option>");
			select.find('option:last').attr("selected", true);
		}
		select.attr("data-existsDefault", "");
		//下拉框中若只有一个选项，则下拉框不可编辑。
		if(select.find('option').length <= 1){
			select.prop('disabled', true).selectpicker('refresh');
		}else{
			select.prop('disabled', false).selectpicker('refresh');
		}
	};
	
	//配置选项变换处理方法
	var onItemSelectChange = function(obj, container){
		var op = commonOptions.modelConfig;
		if(null != obj){
			var itemData = obj.data(op.itemDataTag);
			var itemTmpData = obj.data(op.itemTmpData);
			var oldValue = "";
			var oldDescId = "";
			if(itemTmpData){
				oldValue = itemTmpData['rsValueCode'];
				oldDescId = itemTmpData['descId'];
			}
			var newValue = obj.val();
			var newDescId = obj.find('option:selected').attr('descid');
			var level = itemData.level;
			var itemCode = itemData.code;
			try {
				//特殊处理下拉框无值的情况
				if(newValue == '-1'){
					obj.data(op.itemTmpData, {'descId':'','rsValueCode':''});
					return;
				}
				if(oldValue != newValue){
					var priceId = op.itemPricesName+"_"+level+"_"+itemCode;
					var rsValues = itemData['rsValues'];
					
					var times = 0;
					var needQuery = "0";
					var newPrice = 0 ;
					var newDesc = '';
					for(var key in rsValues){
						var rsValue = rsValues[key];
						var rsValueCode = rsValue.code;
						var isCombine = rsValue.isCombine;
						var descId = rsValue.descId;
						var price = rsValue.price;
						
						if(oldValue == rsValueCode || newValue == rsValueCode){
							needQuery = isCombine;
							times = times + 1;
							if(newValue == rsValueCode){
								newDesc = descId;
								newPrice = price;
							}
						}
						if(times==2 || needQuery=="10041001"){
							break;
						}
					}
					if("10041002"==needQuery){
						obj.data(op.itemTmpData, {'descId':newDescId,'rsValueCode':newValue});
						obj.parents(".form-group").find("#"+priceId).val(newPrice);
					}else{
						getModelRelationConfig(container, itemCode, level, oldValue, newValue, oldDescId, newDescId);
					}
				}
			} catch (e) {
				dmsCommon.tip({status:"error",msg:"获取车型相关性配置发生异常，异常信息：" + e.message});//总共的状态类型：info、success、error、warning
			}
		}
	};
	//获取车型相关性配置
	var getModelRelationConfig = function(container, itemCode, level, oldValue, newValue, oldDescId, newDescId){
		var op = commonOptions.modelConfig;
		var modelCode = $("#modelCode", container).val();			//基础车型
		var paramsObj = {
				'modelCode' : modelCode,
				'itemCode' : itemCode,
				'level' : level,
				'oldValue' : oldValue,
				'newValue' : newValue,
				'oldDescId' : oldDescId,
				'newDescId' : newDescId
		};
		dmsCommon.ajaxRestRequest({
			url : dmsCommon.getDmsPath()["business"] + "/rsModel/common/modelRelationConfig",
			data : paramsObj,
			type : "GET",
			async : false,
			sucessCallBack : function(response){
				doWithModelRelationConfig(container, response);
//				console.dir(response);
			},
			errorCallBack : function(errorData){
				dmsCommon.tip({status:'error', msg:"获取车型相关性配置发生异常，异常信息:'" + errorData['errMsg']+"',请重新选单!!!"});
				$('#'+op.itemSelectCode+'_'+level+'_'+itemCode, container).selectpicker('val', oldValue);
			}
		});
	};
	//处理相关信息配置信息
  	var doWithModelRelationConfig = function(container, result){
  		var op = commonOptions.modelConfig;
  		if(result){
  			var itemCode;
  			var oldValue;
  			var newValue;
  			var level;
  			try {
	  			itemCode = result.itemCode;
	  			level = result.level;
	  			oldValue = result.oldValue;
	  			newValue = result.newValue;
	  			var newDescId = result.newDescId;
	  			var price = result.price;
	  			var itemList = result.itemList;
//	  			console.dir(itemList);
//	  			console.dir(createModelConfigStructure(itemList));
	  			//变更配置下拉选项
  				doChangeItemsByRelationConfig(container, createModelConfigStructure(itemList));
  				//变更配置项数据源
  				$('#'+op.itemSelectCode+'_'+level+'_'+itemCode, container).data(op.itemTmpData, {'descId':newDescId, 'rsValueCode':newValue})
				//变更配置项价格
				$('#'+op.itemPricesName+'_'+level+'_'+itemCode, container).val(price);
				sumRsItemPrice(container);
				sumTotalPrice(container);
	  		} catch (e) {
	  			if(""!=itemCode && ""!=oldValue){
	  				dmsCommon.tip({status:'error', msg:"获取车型相关性配置发生异常，异常信息:'"+ e.message+ "'"});
	  				$('#'+op.itemSelectCode+'_'+level+'_'+itemCode, container).selectpicker('val', oldValue);
	  			}else{
	  				throw e;
	  			}
			}
  		}
  	};
  	//根据相关性配置信息，变更配置项
	var doChangeItemsByRelationConfig = function(container, items){
		var op = commonOptions.modelConfig;
  		try {
			for(var key in items){
				var item = items[key];
				var itemCode = item.code;
				var itemName = item.name;
				var level = item.level;
				var rsValues = item.rsValues;
				//删除指定配置项的所有配置选项
				deleteAllSelectOptions(container, itemCode, level);
				//向配置项DOM添加配置选项
				addSelectOption($(container), itemCode, rsValues);
			}
		} catch (e) {
			throw e;
		}
	};
	//删除配置项中的所有配置选项
	var deleteAllSelectOptions = function(container, itemCode, level){
		var op = commonOptions.modelConfig;
		var selObj = $('#'+op.itemSelectCode+'_'+level+'_'+itemCode, container);		//指定配置项下拉框
		var priceObj = $('#'+op.itemPricesName+'_'+level+'_'+itemCode, container);		//指定配置项差价文本框
		$('button[data-id="'+selObj.prop('id')+'"]', container).css('color', 'black');
		selObj.empty().prop('disabled', true).selectpicker('refresh');
		priceObj.css('color', 'black').prop('readonly', true).val('0');
	};
	//计算选配项合计价格
	var sumRsItemPrice = function(container){
		var configOtherAmount = $('#configOtherAmount', container);			//常规订单配置说明其它金额
		var nonconfigOtherAmount = $('#nonconfigOtherAmount', container);	//常规订单非配置说明其它金额
		var op = commonOptions.modelConfig;
		var sumPrice = 0;
		container.find("input[name=" + op.itemPricesName + "]").each(function(i, obj){
			var price = $(this).val();
			if(price && !isNaN(price)){
				sumPrice = sumPrice + parseInt(price);
	    	}
		});
		if(configOtherAmount.length > 0){
			if(configOtherAmount.val() && !isNaN(configOtherAmount.val())){
				sumPrice = sumPrice + parseInt(configOtherAmount.val()*10000);
			}else{
				configOtherAmount.val(0);
			}
		}
		if(nonconfigOtherAmount.length > 0){
			if(nonconfigOtherAmount.val() && !isNaN(nonconfigOtherAmount.val())){
				sumPrice = sumPrice + parseInt(nonconfigOtherAmount.val()*10000);
			}else{
				nonconfigOtherAmount.val(0);
			}
		}
		container.find("#" + op.itemSumPriceID).val(sumPrice);
	};
	
	var sumTotalPrice = function(container){
		var isIrregular = arguments[1];			//非常规金额计算标识
		var orderQty = $('#orderQty', container).val();
		var modelPrice = $('#modelPrice', container).val();
		var matchPrice = $('#matchPrice', container).val();
		var basicPoint = $('#basicPoint', container).val();
		var refitPrice = $('#refitPrice', container).val();
		var refitPoint = $('#refitPoint', container).val();
		var otherAmount = $('#otherAmount', container).val();
		var basicPrice = 0;
		var tprice = 0.00;
		if (modelPrice == ""){
			modelPrice = 0;
		}
		if (matchPrice == ""){
			matchPrice = 0;
		}
		if(isIrregular){
			basicPrice = $('#basicPrice', container).val()*10000;
		}else{
			basicPrice = parseFloat(modelPrice) + parseFloat(matchPrice);
		}
		basicPrice = (basicPrice/10000).toFixed(3);
		try{
			if(isIrregular){
				$('#basicPrice', container).val(basicPrice);
			}else{
				$('#basicPrice', container).val(basicPrice).blur();
			}
		}catch(e){
			dmsCommon.tip({status:'error', msg:"价格计算时发生错误！请联系管理员！错误原因："+e})
		}
		if (basicPoint == ""){
			basicPoint = 0.00;
		}
		if (refitPrice == ""){
			refitPrice = 0.000;
		}
		if (refitPoint == ""){
			refitPoint = 0.00;
		}
		if (otherAmount == ""){
			otherAmount = 0.00;
		}
		if(basicPoint == refitPoint){
			var point = ((100-refitPoint)/100).toFixed(3);
		  	var a_price = parseFloat(basicPrice) + parseFloat(refitPrice);
			tprice = accMul(a_price,point);
		}else{
			var point1 = ((100-basicPoint)/100).toFixed(3);
			var point2 = ((100-refitPoint)/100).toFixed(3);
			var dp1 = accMul(basicPrice, point1);
			var sz1 = accMul(refitPrice, point2);
			tprice = accAdd(dp1, sz1);
		}
		tprice = tprice + parseFloat((otherAmount*1).toFixed(2));
		tprice = tprice.toFixed(2);
		$('#totalPrice', container).val(tprice);
		$('#singlePrice', container).val(tprice);
		
		var orderAmount = (tprice*parseInt(orderQty)).toFixed(2);
		$('input[name="orderAmount"]', container).val(orderAmount);
		$('#orderAmountFin', container).val(formatChineseNumeral(orderAmount*10000));
		
		
		function accAdd(arg1,arg2){   
			var r1,r2,m;   
			try{r1 = arg1.toString().split(".")[1].length}catch(e){r1=0}   
			try{r2 = arg2.toString().split(".")[1].length}catch(e){r2=0}   
			m = Math.pow(10,Math.max(r1,r2))   
			return (arg1*m+arg2*m)/m   
		} 
		
		function accMul(arg1, arg2) {
			var m = 0,s1 = arg1.toString(), s2 = arg2.toString();
			try{m += s1.split(".")[1].length}catch(e){}
			try{m += s2.split(".")[1].length}catch(e){}
			return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m);
		}
	}
	
	//级联配置项值变化
	var doWithValueChangeCascade = function(container, itemCode, descId, rsValueCode, others){
		var op = commonOptions.modelConfig;
		var modelCode = $("#devModelCode", container).val();
		
		//处理驾驶室变动，设计型号对应变动
		if(('110' == itemCode || 'DH1_110' == itemCode) && descId){
			var newModelCode = "";
			var cabType = descId.charAt(3);
			var type = modelCode.charAt(2);
			if(type=='5'){
				var subStr1 = modelCode.substring(0,9);
				var subStr2 = modelCode.substring(10);
				newModelCode = subStr1 + cabType + subStr2;
			}else{
				var subStr1 = modelCode.substring(0,6);
				var subStr2 = modelCode.substring(7);
				newModelCode = subStr1 + cabType + subStr2;
			}
			if(""!=newModelCode && modelCode != newModelCode){
				$("#devModelCode", container).val(newModelCode);
			}
			return ;
		}
		//轮胎价格处理：
		if('961'== itemCode){
			var price = 0 ;
			var type = modelCode.charAt(2);
			var quantity = 0;
			var drive = "";
			if(type=='5'){
				drive = modelCode.charAt(13);
			}else{
				drive = modelCode.charAt(10);
			}
			//4×2
			if('1'==drive){
				quantity = 7;
			//6×2
			}else if('3'==drive || '9'==drive){
				quantity = 9;
			//6×4
			}else if('4'==drive){
				quantity = 11;
			//8×4
			}else if('6'==drive){
				quantity = 13;
			}
			var level = "1";
			var priceId = op.itemPricesName + '_' + level + '_'+itemCode;
			var _price = $("#"+priceId, container).val();
			if(_price!=''){
				price = quantity * parseInt(_price);
			}
			$("#"+priceId, container).val(price);
			return ;
		}
		//颜色处理价格处理：
		if('401'== itemCode && descId){
			var price = 0 ;
			var type = modelCode.charAt(2);
			var colorType = descId.charAt(0);
			if(type=='3' && colorType == 'A'){
				price = 1500;
			}
			var level = "1";
			var priceId = op.itemPricesName + '_' + level + '_'+itemCode;
			$("#"+priceId, container).val(price);
			return ;
		}
		
		//轮胎品牌价格处理：
		if('501'== itemCode && descId){
			var price = 0 ;
			var tireType = descId.charAt(0);
			if(tireType!='A'){
				var quantity = 0;
				var drive = "";
				var type = modelCode.charAt(2);
				if(type=='5'){
					drive = modelCode.charAt(13);
				}else{
					drive = modelCode.charAt(10);
				}
				//4×2
				if('1'==drive){
					quantity = 7;
				//6×2
				}else if('3'==drive || '9'==drive){
					quantity = 9;
				//6×4
				}else if('4'==drive){
					quantity = 11;
				//8×4
				}else if('6'==drive){
					quantity = 13;
				}
				var onePrice = 550;
				//玲珑、三角 450
				if('501004'==descId || '501002' ==descId){
					onePrice = 450;
				//双钱：700
				} else if ('501003' == descId){
					onePrice = 700;
				//朝阳：1250
				} else if('501001' == descId) {
					onePrice = 1250;
				}
				price = quantity * onePrice;
			}
			var level = "1";
			var priceId = op.itemPricesName + '_' + level + '_'+itemCode;
			$("#"+priceId, container).val(price);
			return ;
		}
		
		//若页面上存在其它约定字段，则根据发动机型号“排放标准”处理其它约定
		var otherMatters = $('#otherMatters', container);
		if('901'== itemCode && otherMatters.length > 0){
			
			dmsCommon.ajaxRestRequest({
				url : dmsCommon.getDmsPath()["business"] + "/rsModel/common/engineType/"+descId,
				type : "GET",
				async : false,
		        sucessCallBack : function(engineItem){
		        	var commonData = dmsCommon.getCommonData();
		        	var mainOtherMatters = commonData['systemParam']['1042']['Vehicle_orderOtherMatters'];
		        	var attachOtherMatters = "本合同项下车辆符合买方所需的\"国三标准\"，仅适用出口销售并在境外环境使用。买方在此确认并有义务告知其最终用户所购车辆的销售、使用环境。" +
		        		"因未出口销售车辆或未在境外使用车辆的，由此产生的责任和后果由买方承担。买方知悉并明示最终用户在车辆使用前应仔细阅读产品说明书，并按产品说明书内容合理使用车辆。" +
		        		"买方未尽义务告知最终用户或最终用户不适当操作、维修等，导致车辆损坏及其他损失的,由买方承担由此而产生的所有后果和损失。";
		        	
					//国三标准发动机，其他约定中添加【“国三标准”说明】；非国三发动机，其他约定中去掉【“国三标准”说明】
					if(otherMatters.val().indexOf('国三标准') < 0 && engineItem['ENGINE_TYPE'] == '3'){
						otherMatters.val(mainOtherMatters + attachOtherMatters);
					} else if(otherMatters.val().indexOf('国三标准') >= 0 && engineItem['ENGINE_TYPE'] != '3'){
						otherMatters.val(mainOtherMatters);
					}
		        },
		        errorCallBack : function(errorData){
					dmsCommon.tip({status:'warning', msg:"获取发动机型号“排放标准”发生异常，异常信息:'"+ errorData.msg +"'请重新选单!!!"});
					params = null;
				}
			});
		}
	};
	
	//根据所选描述，修改配置选项和差异价格
	var specialConfigItemChange = function(container, data){
		var itemCode = data['itemCode'];
		var itemSel = data['topItemValueCode'];
		var priceInput = data['topItemPriceCode'];
		var attrId = data['attrId'];
		var attrCode = data['attrCode'];
		var attrName = data['attrName'];
		var level = data['level'];
		var isDetailFlag = $('#'+itemSel, container).parents(".dms-edit:first").attr("data-isDetailFlag");
		if(isDetailFlag){
			//明细页面标红已选择描述的配置选项
			$('#'+priceInput, container).css('color', 'red');
			$('#'+itemSel, container).append('<option data-specialItem="true" title="'+attrName+'"' +
					'value="'+attrCode+'" descid="'+attrCode+'" >'+attrName+'</option>').selectpicker('refresh');
			$('#'+itemSel, container).selectpicker("val", attrCode);
			$('button[data-id="'+itemSel+'"]', container).css('color', 'red');
		}else{
			if(level != 2 || itemCode != '110'){			//不为二级驾驶室
				if($('#'+priceInput, container).prop('readonly')){
					//选择描述时，将差价文本框改为可编辑。
					$('#'+priceInput, container).val('0').prop('readonly', false).css('color','red');
				}else{
					//选择描述时，若已存在描述option，则移除之前已存在的描述。
					$('#'+priceInput, container).val('0');
					$('#'+itemSel+' option:last', container).remove();
					$('#'+itemSel, container).selectpicker('refresh');
				}
			}
			//选择描述时，往配置项下拉框的最后位置插入一条option;
			$('#'+itemSel, container).append('<option data-specialItem="true" title="'+attrName+'"' +
				'value="'+attrCode+'" descid="'+attrCode+'" style="color:red">'+attrName+'</option>').selectpicker('refresh');
			$('#'+itemSel, container).selectpicker("val", attrCode).selectpicker('refresh');
			$('button[data-id="'+itemSel+'"]', container).css('color','red');
			
			if(level != 2 || itemCode != '110'){			//不为二级驾驶室
				$('#'+itemSel, container).prop('disabled', false).selectpicker('refresh');
			}
			
			if(level && '1' == level && '110' == itemCode){			//一级驾驶室驱动二级驾驶室变动
				var _itemSel = itemSel.replace('1_DH1','2');
				var _priceInput = priceInput.replace('1_DH1','2');
				$('#'+_itemSel, container).append('<option data-specialItem="true" title="'+attrName+'"' +
						'value="'+attrCode+'" descid="'+attrCode+'" style="color:red">'+attrName+'</option>').selectpicker('refresh');
				$('#'+_itemSel, container).selectpicker("val", attrCode).selectpicker('refresh');
				$('button[data-id="'+_itemSel+'"]', container).css('color','red');
				$('#'+_priceInput, container).val('0');
			}
			//级联变动
			doWithValueChangeCascade(container, itemCode, attrCode);
			
			sumRsItemPrice(container);
			sumTotalPrice(container);
		}
	}
	
	//更新配置列表
	var updateConfigTable = function(container, modelList){
		var isIrregular = arguments[2];			//非常规订单标识
		var op = commonOptions.modelConfig;
		var configTable = $("#"+op.configTableID,container);
		//配置项明细赋值
    	$.each(modelList, function(i, row){
    		var isSpecial = row['IS_SPECIAL'];
    		var level = isIrregular ? "1":row['ITEM_LEVEL'];			//非常规配置列表无层级关系
    		var itemCode = row['ITEM_ID'];
    		if(!isIrregular && '1' == level && '110' == itemCode){		//非常规无DH1_110
    			itemCode = "DH1_" + row['ITEM_ID'];
    		}
    		var sel = configTable.find("#"+op.itemSelectCode+'_'+level+'_'+itemCode);
    		if(sel.length){
    			var valueCode = row['VALUE_CODE'];
    			var valueDesc = row['VALUE_DESC'];
    			if(valueDesc){
    				valueDesc = valueDesc.escape2Html();
    			}
        		if(sel.is(":text")){
        			sel.val(valueDesc);
        			configTable.find("#"+op.itemSelectValue+'_'+level+'_'+itemCode).val(valueCode);
        		}else{
        			if('10041001' == isSpecial){			
//        				if(itemCode = 'DH1_110') itemCode = itemCode.replace('DH1_', '');
        				specialConfigItemChange(container,{
        					'attrId':row['VALUE_ID'], 'attrCode':valueCode, 'attrName':valueDesc,
        					'topItemValueCode':op.itemSelectCode+'_'+level+'_'+itemCode, 
        					'topItemPriceCode':op.itemPricesName+'_'+level+'_'+itemCode,
        					'itemCode':itemCode,'level':level
        				});
        			}else{
        				sel.selectpicker('val', valueCode || '-1');
        				//下拉框改变时，执行自定义事件。
        				onItemSelectChange(sel, container);
        				//更新下拉框数据源
        				sel.data(op.itemTmpData, {'descId':row['ATTR_ID'],'rsValueCode':valueCode});
        			}
        		}
    			configTable.find("#"+op.itemPricesName+'_'+level+'_'+itemCode).val(row['DIFF_PRICE']);
    		}
    	});
		//选装金额计算
    	if(!isIrregular){
    		sumRsItemPrice(container);
    	}
		//总金额计算
		sumTotalPrice(container, isIrregular);
	}
	
	//拼装配置项列表
	var spliceConfigTable = function(container, configList, isAllZeroPrice){
		var op = commonOptions.modelConfig;
		$('input[name='+op.itemSelectName+']', container).each(function(){
			var itemCode = $(this).val();
			var level = $(this).attr('id').split('_')[1];
			var valueId, valueCode, valueName, descId;
			var isSpecialItem;		//是否选择了描述
			if($('#'+op.itemSelectCode+'_'+level+'_'+itemCode, container).is(":text")){
				descId = $('#'+op.itemSelectValue+'_'+level+'_'+itemCode, container).val();
				valueCode = $('#'+op.itemSelectValue+'_'+level+'_'+itemCode, container).val();
				valueName = $('#'+op.itemSelectCode+'_'+level+'_'+itemCode, container).val();
			}else{
				if($('#'+op.itemSelectCode+'_'+level+'_'+itemCode, container).find("option:selected").attr('data-specialItem'))
					isSpecialItem = '10041001';
				else 
					isSpecialItem = '10041002';
				descId = $('#'+op.itemSelectCode+'_'+level+'_'+itemCode, container).find("option:selected").attr("descid");
				valueId = $('#'+op.itemSelectCode+'_'+level+'_'+itemCode, container).find("option:selected").attr("valueid");
				valueCode = $('#'+op.itemSelectCode+'_'+level+'_'+itemCode, container).val();
				valueName = $('#'+op.itemSelectCode+'_'+level+'_'+itemCode, container).find("option:selected").text();
			}
			//无配置项保存为空值
			if(valueCode == "-1"){
				isSpecialItem = "", valueId = "", valueCode = "", valueName = "";
			}
			var itemPrice = $('#'+op.itemPricesName+'_'+level+'_'+itemCode, container).val();
			//将所有差价金额置0。 PS：监控预投金额为0。
			if(isAllZeroPrice){
				itemPirce = 0;
			}
			configList.push({"itemCode":itemCode,"itemLevel":level,"valueId":valueId,"valueCode":valueCode,"valueDesc":valueName,"diffPrice":itemPrice,"isSpecial":isSpecialItem,
						"attrId":descId});
		});
		
		return configList;
	}
	
	//初始化配置列表(常规订单)
	var initConfigTable = function(container, modelList, isIrregular, devModelCode, isHidePrice){
		var op = commonOptions.modelConfig;
//		var isIrregular = arguments[2];
		var configTable = $("#"+op.configTableID, container);
		var ifLng;
		//通过设计型号判断此车型是否天然气车
		if(devModelCode){
			if(devModelCode.substr((devModelCode.length-2),2)=='TL' || devModelCode.substr((devModelCode.length-3),2)=='TL'){
				ifLng = 1;
			}
		}
		//清空原配置项列表
		configTable.empty();
		//非常规创建配置项列表
		if(isIrregular){
			for(var key in modelList){
				var item = modelList[key];
				//非天然气车不创建气瓶配置项
				if('601' == item.CODE && !ifLng) continue ;
				addIrregularConfigItem(configTable, item);
			}
			//初始化表单（将按钮控件生效）
			dmsCommon.handleFormStatic(configTable);
			return;
		}else{			//常规订单创建配置项列表
			//拼接配置数据源
			var modelConfig = createModelConfigStructure(modelList);
			
			//创建配置项列表
			for(var key in modelConfig){
				var item = modelConfig[key];
				var childRsItems = item.childRsItems;
				
				if(!childRsItems){
					var type = item.type;
					if('30011001' == type){
						//创建研究院的配置结构
						addParentItemRow(configTable, item);
					}else{
						//非天然气车不创建气瓶配置项
						if('601' == item.code && !ifLng) continue ;
						//创建销司的配置结构
						addItemConfigRowTD(configTable, item);
					}
				}else{
					//创建研究院的配置结构
					addParentItemWithSubItemRow(configTable, item);
				}
			}
			
			//是否隐藏金额文本框 PS 预排监控不需显示常规订单金额  
			if(isHidePrice){
				//根据生成列表样式查找元素，如果修改了样式，请检查此方法是否存在问题--@checkYs。
				$('input[name="'+ op.itemPricesName +'"]', container).closest('div.col-xs-2,div.col-xs-1').css('display', 'none')
					.closest('div.col-xs-12').find('div.col-xs-6,div.col-xs-7').prop('class', 'col-xs-8');
				$('input[name="'+ op.itemPricesName +'"]', container).closest('div.col-xs-12').find('div.col-xs-10').prop('class', 'col-xs-11');
			}
		}
		//绑定事件
		configTable.find('[name='+op.itemSelectCode+']').change(function(){
			//重新选择标配选配时，若之前已选择描述，将描述移除，并将差价文本框改为不可编辑。
			var selectObjId = $(this).attr("id");			
			var tmpSelectValue = $(this).val();
			var tmpPirceInput = $("#"+selectObjId.replace(op.itemSelectCode, op.itemPricesName), container);
			if(false == tmpPirceInput.prop('readonly')){
				$(this).find('option:last').remove();
				if($(this).find('option').length <= 1){
					$(this).prop('disabled', true);
				}
				$(this).selectpicker('refresh');
//				$(this).selectpicker('val', tmpSelectValue);
				tmpPirceInput.val('0').prop('readonly', true).css('color','');
				$('button[data-id="'+selectObjId+'"]', container).css('color','');
				if(selectObjId.indexOf('1_DH1_110') > 0){
					//一级驾驶室驱动二级驾驶室变动
					var _selectObjId = selectObjId.replace('1_DH1', '2');			//二级驾驶室ID
					var _selectObj = $('#'+_selectObjId, container);				//二级驾驶室下拉框
					var _priceInput = $('#'+_selectObjId.replace(op.itemSelectCode, op.itemPricesName), container);		//二级驾驶室金额文本框
					_selectObj.find('option:last').remove();
					_selectObj.selectpicker('refresh');
					_priceInput.val('0');
					$('button[data-id="'+_selectObjId+'"]', container).css('color','');
				}
			}
//				console.info(JSON.stringify($(this).data(op.itemDataTag)));
			var itemData = $(this).data(op.itemDataTag);
			var valueCode = $(this).val();
			if($(this).is(":text")){
				valueCode = $("#"+op.itemSelectValue+"_"+itemData.level+"_"+itemData.code).val();
				doWithValueChangeCascade(container, itemData.code, valueCode);			//此时文本框的valueCode为配置描述Code
			}else{
				onItemSelectChange($(this),container);		//下拉框改变时，执行自定义方法。
				var descId = $(this).find('option:selected').attr('descid');
				doWithValueChangeCascade(container, itemData.code, descId, valueCode);	//此时下拉框的valueCode为配置选项Code
			}
			sumRsItemPrice(container);
			sumTotalPrice(container);
		});
		//差价文本绑定更改事件
		configTable.find('[name='+op.itemPricesName+']').off('change.bussiness').on('change.bussiness', function(){
			sumRsItemPrice(container);
			sumTotalPrice(container);
		});
		//配置项描述弹出框绑定数据源
		configTable.find('[name="itemValueBtn"]').off('beforeShow.dms').on('beforeShow.dms',function(event, obj){
			var modelCode = $('#modelCode', container).val();
			if(!modelCode){
				dmsCommon.tip({status:"warning",msg:"请先选择基础车型！"});//总共的状态类型：info、success、error、warning
				obj.status = false;
				return;
			}
			$(this).data('pageData',$.extend($(this).data('pageData'),{
				'modelCode' : modelCode
			}));
			obj.status = true;
		});
		sumRsItemPrice(container);
		sumTotalPrice(container);
		//初始化表单（将按钮控件生效）
		dmsCommon.handleFormStatic(container);
	}
	
	//非常规订单生成配置项
	var addIrregularConfigItem = function (panel, item){
		var itemCode = item.CODE;
		var itemName = item.NAME;
		var isEmpty = item.ISEMPTY;
		var op = commonOptions.modelConfig;
		var isDetailFlag = panel.parents(".dms-edit:first").attr("data-isDetailFlag");
		var level = '1';
//		if('1' == level && '110' == itemCode){
//			itemCode = "DH1_" + itemCode;
//		}
		var isRequiredCss = '';
//		if({'110':true,'901':true,'922':true,'401':true}[itemCode] || false){
//			isRequiredCss = 'required';
//		}
//		@update
		if('10041001' == isEmpty){
			isRequiredCss = 'required';
		}
		
		var htmlStr = '<div class="col-xs-12 col-sm-6 col-md-4"><div class="form-group">';
		if(isDetailFlag&&isDetailFlag=="true"){
			htmlStr += '<label class="control-label col-xs-4">'+itemName+'</label>'
		}else{
			htmlStr += '<label class="control-label col-xs-4"><a data-url="common/itemValuesQueryDialog.html" data-width="modal-lg" data-toggle="modal"> <i class="fa fa-plus-square"></i> '+itemName+'</a></label>'
		}
		htmlStr += '<div class="col-xs-8">'
			+ '<input id="'+op.itemSelectName+'_'+level+'_'+itemCode+'" name="'+op.itemSelectName+'" value="'+itemCode+'" type="hidden" />'
			+ '<input id="'+op.itemSelectCode+'_'+level+'_'+itemCode+'" name="'+op.itemSelectCode+'" class="form-control '+isRequiredCss+'" readonly type="text" value="" />'
			+ '<input id="'+op.itemSelectValue+'_'+level+'_'+itemCode+'" name="'+op.itemSelectValue+'" type="hidden" value="" />'
			+ '</div>'
			+ '</div></div>';
		var htmlObj = $(htmlStr);
		var selObj = htmlObj.find('input[name="'+op.itemSelectCode+'"]');
		selObj.data(op.itemDataTag, item);
		var btnObj = htmlObj.find('a:first');
		btnObj.data("pageData", {"itemType":"1","orderType":"2","topItemCode":/*('1' == level && 'DH1_110' == itemCode ? itemCode.replace('DH1_',''):*/itemCode/*)*/,
			"topItemValueCode":op.itemSelectCode+'_'+level+'_'+itemCode,
			"topItemValueName":op.itemSelectValue+'_'+level+'_'+itemCode,'level':level});
		panel.append(htmlObj);
	};
	
	//字符串格式化 StringFormat("abc{1}def{2}","123","312");
	var stringFormat = function() {
		if (arguments.length == 0) return null;
		var str = arguments[0];
		for (var i = 1; i < arguments.length; i++) {
			var re = new RegExp('\\{' + (i) + '\\}', 'gm');
			str = str.replace(re, arguments[i]);
		}
		return str;
	};
	//查询功能生成配置列表
	var searchConfigTable = function(panel, configList){
		$.each(configList, function(i, configItem){
			var itemCode = configItem['ITEM_CODE'];
			var itemName = configItem['ITEM_NAME'];
			var valueDesc = configItem['VALUE_DESC'];
			var itemLevel = configItem['ITEM_LEVEL'];
			if(2 == itemLevel && '110' == itemCode) return;
			var htmlStr = '<div class="col-xs-12 col-sm-6 col-md-4"><div class="form-group">' + 
						  '<label class="control-label col-xs-4">'+itemName+'</label>' +
						  '<div class="col-xs-8">' +
						  '<input type="text" id="'+ itemCode +'" name="'+ itemCode +'" class="form-control" readonly value="'+ valueDesc +'" title="'+ valueDesc +'"/>'
						  '</div>' +
						  '</div></div>';
			panel.append($(htmlStr));
		});
	};
	
	//--------------------------------------------------物料，交货期相关算法--------------------------------------------------//
	/***
	 * 获取交货期及物料
	 */
	var getOrderDeliveryCycle = function(params) {
		var itemStr = '';
		var valueStr = '';
		var orderType = params.orderType;					//订单类型 
		var seriesIdValue = params.seriesIdValue;			//标的
		var vehicleTypeValue = params.vehicleTypeValue;		//标的
		var devModelCode = params.devModelCode;				//设计型号
		var isNeedProduct = params.isNeedProduct || '0';
		var designDays = params.designDays || '';
		var productDays = params.productDays || '';
		var modelVersionId = params.modelVersionId || '';
		
		var refitType = params.refitType;
		var refitConfirmNo = params.refitConfirmNo;
		var refitLetterpress = params.refitLetterpress;
		var items = params.items;
		var values = params.values;
		var isSpecialFlag = params.isSpecialFlag;
		
		
		var paramsObj = {};
		paramsObj.orderType = orderType;
		paramsObj.seriesIdValue = seriesIdValue;
		paramsObj.vehicleTypeValue = vehicleTypeValue;
		paramsObj.devModelCode = devModelCode;
		paramsObj.isNeedProduct = isNeedProduct;
		paramsObj.refitType = refitType;
		paramsObj.refitConfirmNo = refitConfirmNo;
		paramsObj.refitLetterpress = refitLetterpress;
		paramsObj.designDays = designDays;
		paramsObj.productDays = productDays;
		paramsObj.modelVersionId = modelVersionId;
		paramsObj.isSpecialFlag = isSpecialFlag;
		
		//封装配置项编码
		if(null != items && null !=items.length){
			for(var i=0,s=items.length;i<s;i++){
				var itemCode = $(items[i]).val();
				itemStr = itemStr + "/" + itemCode;
			}
			itemStr = itemStr.substr(1);
		}
		
		//封装配置项值
		if(null != values && null !=values.length){
			for(var i=0,s=values.length;i<s;i++){
				var itemValue = $(values[i]).val();
				valueStr = valueStr + "/" + itemValue;
			}
			valueStr = valueStr.substr(1);
		}
		
		paramsObj.itemStr = itemStr;
		paramsObj.valueStr = valueStr;
		
		dmsCommon.ajaxRestRequest({
			url : dmsCommon.getDmsPath()["business"] + "/rsModel/common/deliveryCycle",
			data : paramsObj,
			type : "GET",
			async : false,
			sucessCallBack : function(response){
				params = response;
			},
			errorCallBack : function(errorData){
				dmsCommon.tip({status:'warning', msg:"获取物料编码交货期发生异常，异常信息:'" + errorData.msg+"'请重试！"});
				params = null;
			}
		});
		
		return params;
	}
	
	/***
	 * 获取物料编码
	 */
	var getOrderInSideCode = function(params){
		var itemStr = '';
		var valueStr = '';
		var devModelCode = params.devModelCode;
		var refitType = params.refitType;
		var items = params.items;
		var values = params.values;
		
		var paramsObj = {};
		paramsObj.devModelCode = devModelCode;
		paramsObj.refitType = refitType;
		
		//封装配置项编码
		if(null != items && null !=items.length){
			for(var i=0,s=items.length;i<s;i++){
				
				var itemCode = $(items[i]).val();
				itemStr = itemStr + "/" + itemCode;
			}
			itemStr = itemStr.substr(1);
		}
		
		//封装配置项值
		if(null != values && null !=values.length){
			for(var i=0,s=values.length;i<s;i++){
				var itemValue = $(values[i]).val();
				valueStr = valueStr + "/" + itemValue;
			}
			valueStr = valueStr.substr(1);
		}
		
		paramsObj.itemStr = itemStr;
		paramsObj.valueStr = valueStr;
		
		dmsCommon.ajaxRestRequest({
			url : dmsCommon.getDmsPath()["business"] + "/rsModel/common/insideCode",
			data : paramsObj,
			type : "GET",
			async : false,
			sucessCallBack : function(response){
				params = response;
			},
			errorCallBack : function(errorData){
				dmsCommon.tip({status:'warning', msg:"获取物料编码发生异常，异常信息:'" + errorData.msg+"'请重试！"});
				params = null;
			}
		});
		
		return params;
	}
//	//处理物料编码交货期获取结果
//	var doWithOrderDeliveryCycle = function(data) {
//		if(null != data){
//			var itemCode = "";
//			var oldValue = "";
//			var level = "";
//			var result = data;
//			var inSideCode  = result.inSideCode;
//			var designCycle  = result.designCycle;
//			var productCycle  = result.productCycle;
//			var deadLine  = result.deadLine;
//			var chasisDeadLine  = result.chasisDeadLine;
//			var hasCommon = result.hasCommon;
//			
//			__params.inSideCode.value = inSideCode;
//			__params.designCycle.value = designCycle;
//			__params.productCycle.value = productCycle;
//			__params.deadLine.value = deadLine;
//			__params.chasisDeadLine.value = chasisDeadLine;
//			if(__params.hasCommon!=null){
//				__params.hasCommon.value = hasCommon;
//			}
//  				
////	 			}else{
////	 				var message = result.message;
////	 				alert("获取物料编码交货期发生异常，异常信息:'" + message+"'");
////	 			}
//		}
//	}
//	
	
	//--------------------------------------------------物料，交货期相关算法--------------------------------------------------//
	//------------------------------------------------------合格证相关------------------------------------------------------//
	//合格证模板
	var certificateSchablone = {
		//其它公用参数
		CommonParams : {
			certificateDivId : 'certificateDiv'
		},
		//定义字段命名
		nameSpace : {
			hqsb : '后桥速比',
			bsqxh : '变速器型号',
			fdjxh : '发动机型号',
			ltgg : '轮胎规格',
			zzl : '总质量',
			zbzl : '整备质量',
			edzzl : '额定载质量',
			zqyzl : '准牵引质量',
			azzzl : '鞍座载质量',
			zcrs : '准乘人数',
			zgcs : '最高车速',
			zcwkc : '整车外廓长',
			zcwkk : '整车外廓宽',
			zcwkg : '整车外廓高',
			szccc : '上装长',
			szcck : '上装宽',
			szccg : '上装高',
			gtrj : '罐体容积'
		},
		//整车模板
		ZC : {
			//牵引车模板
			QYC : {
				fdjxh : '',
				ltgg : '',
				zzl : '',
				zbzl : '',
				zqyzl : '',
				azzzl : '',
				zcrs : '',
				zgcs : '',
				zcwkc : '',
				zcwkk : '',
				zcwkg : ''
			},
			//非牵引车模板
			NON_QYC : {
				fdjxh : '',
				ltgg : '',
				zzl : '',
				zbzl : '',
				edzzl : '',
				zcrs : '',
				zgcs : '',
				zcwkc : '',
				zcwkk : '',
				zcwkg : '',
				szccc : '',
				szcck : '',
				szccg : '',
				gtrj : ''
			}
		},
		//二类底盘模板
		DP : {
			//非牵引车模板
			NON_QYC : {
				fdjxh : '',
				ltgg : '',
				zbzl : '',
				zcrs : '',
				zgcs : ''
			}
		}
	}
	//结构化公告油耗数据
	var structurPubFuelData = function(data, template){
		$.each(data, function(key, value){
			if(typeof value === 'string' && value.split(',').length > 1){
				data[key] = value.split(',');
			}
		})
		var _data = {}
		_data.fdjxh = data['FDJXH'];
		try{
			_data.ltgg = isArray(data['LTGG']) ? uniqueArr(data['LTGG']) : data['LTGG'];
		}catch(e){
			dmsCommon.tip({status:'error', msg:"合格证数据处理时发生错误！请联系管理员！错误原因："+e})
		}
		_data.zzl = data['ZZL'];
		_data.zbzl = data['ZBZL'];
		_data.edzzl = data['EDZZL'];
		_data.zqyzl = data['ZQYZZL'];
		_data.azzzl = data['AZZZL'];
		_data.zcrs = data['JSSZCRS'];
		_data.zgcs = data['ZGCS'];
//		_data.zcwkc = data['WKC'];
//		_data.zcwkk = data['WKK'];
//		_data.zcwkg = data['WKG'];
		_data.szccc = data['HXNBC'];
		_data.szcck = data['HXNBK'];
		_data.szccg = data['HXNBG'];
		_data.gtrj = data['GTRJ'];
		if(data && data['YH_GGXH']){
			//存在油耗
//			if(data['YH_ZJSQSB']) _data.hqsb = data['YH_ZJSQSB'];
//			if(data['YH_BSQXH']) _data.bsqxh = data['YH_BSQXH'];
			if(data['YH_ZZL']) _data.zzl = data['YH_ZZL'];
			if(data['YH_FDJXH']) _data.fdjxh = data['YH_FDJXH'];
			try{
				if(data['YH_LTGGXH']) _data.ltgg = isArray(data['YH_LTGGXH']) ? uniqueArr(data['YH_LTGGXH']) : data['YH_LTGGXH'];
			}catch(e){
				dmsCommon.tip({status:'error', msg:"合格证数据处理时发生错误！请联系管理员！错误原因："+e})
			}
			if(data['YH_ZBZL']) _data.zbzl = data['YH_ZBZL'];
			if(data['YH_ZQYZL']) _data.zqyzl = data['YH_ZQYZL'];
			if(data['YH_AZZZL']) _data.azzzl = data['YH_AZZZL'];
			if(data['YH_ZCRS']) _data.zcrs = data['YH_ZCRS'];
			if(data['YH_WKC']) _data.zcwkc = data['YH_WKC'];
			if(data['YH_WKK']) _data.zcwkk = data['YH_WKK'];
			if(data['YH_WKG']) _data.zcwkg = data['YH_WKG'];
			if(data['YH_DXC']) _data.szccc = data['YH_DXC'];
			if(data['YH_DXK']) _data.szcck = data['YH_DXK'];
			if(data['YH_DXG']) _data.szccg = data['YH_DXG'];
			if(data['YH_GTRJ']) _data.gtrj = data['YH_GTRJ'];
		}else{
			delete template["zcwkc"];
			delete template["zcwkk"];
			delete template["zcwkg"];
		}
		//处理罐体容积和上装数据
		if(!_data.gtrj){
			delete template['gtrj'];
		}
		if(!_data.szccc){
			delete template['szccc'];
		}
		if(!_data.szcck){
			delete template['szcck'];
		}
		if(!_data.szccg){
			delete template['szccg'];
		}
		
		//给模板添加数据
		$.each(template, function(key, value){
			if(_data[key]){
				template[key] = _data[key];
			}
		});
	}
	//初始化合格证列表
	var initCertificateTable = function(container, data){
		if(!data || !data['devModelCode']){
			if(!data['devModelCode']){
				return dmsCommon.tip({status:'warning', msg:"初始化合格证时，未找到设计型号，请选择设计型号后再试！"});
			}
			return dmsCommon.tip({status:'warning', msg:"初始化合格证时，未找到完整的公告油耗信息！"});
		}
		var devModelCode = data['devModelCode'];		//设计型号
		var typeCode = devModelCode.charAt(2);			//判断车辆类型 （自卸载货牵引专用）
		var template;									//合格证模板
		var isHandFill = data['isHandFill'];			//是否手填判断标识
		//清除合格证列表
		clearCertificateTable(container);
		if('QX' == data['pubModelType']) template = cloneJson(certificateSchablone.ZC);
		else template = cloneJson(certificateSchablone.DP);
		if('4' == typeCode) template = template.QYC;
		else template = template.NON_QYC;
		//结构化数据
		structurPubFuelData(data, template);
		//创建合格证列表
		createCertificate(container, template, isHandFill, typeCode);
	}
	//创建合格证列表
	var createCertificate = function(container, template, isHandFill, typeCode){
		if(isHandFill)
			//创建手填的合格证列表
			createHandFillCertificateHtml(container, typeCode);
		else
			//创建不用手填的合格证列表
			createNonHandFillCertificateHtml(container, template);
	}
	//生成手填的合格证HTML
	var createHandFillCertificateHtml = function(container, typeCode){
		var isDetailFlag = $(container).find(".dms-edit:first").attr("data-isDetailFlag");
		var required = (isDetailFlag && isDetailFlag == 'true') ? '':'required';
		var readonly = (isDetailFlag && isDetailFlag == 'true') ? 'readonly':'';
		var htmlStr =  '<div class="col-xs-12 col-sm-12 col-md-12">' +
						'<div class="panel panel-default">' +
						'<div class="panel-body">' +
						'<div class="row">' +
						'<div class="col-xs-12 col-sm-6 col-md-4">' +
							'<div class="form-group">' +
								'<label class="control-label col-xs-4">发动机</label>' +
								'<div class="col-xs-8">' +
									'<input type="text" id="fdjxh" name="fdjxh" class="form-control '+ required +'" '+ readonly +
										' data-fieldName="HGZ_FDJXH"/>' +
								'</div>' +
							'</div>' +
						'</div>';
		if('4' != typeCode){
			htmlStr += '<div class="col-xs-12 col-sm-6 col-md-4">' +
						'<div class="form-group">' +
							'<label class="control-label col-xs-4">上装尺寸</label>' +
							'<div class="col-xs-8">' +
								'<input type="text" id="szcc" name="szcc" class="form-control '+ required +'" '+ readonly +
									' data-fieldName="HGZ_SZCC"/>' +
							'</div>' +
						'</div>' +
					 '</div>' ;
		}else{
			htmlStr += '<div class="col-xs-12 col-sm-6 col-md-4">' +
							'<div class="form-group">' +
								'<label class="control-label col-xs-4">整备质量</label>' +
								'<div class="col-xs-8">' +
									'<input type="text" id="zbzl" name="zbzl" class="form-control '+ required +' decimal" '+ readonly +
										' data-fieldName="HGZ_ZBZL"/>' +
								'</div>' +
							'</div>' +
						'</div>' +
						'<div class="col-xs-12 col-sm-6 col-md-4">' +
							'<div class="form-group">' +
								'<label class="control-label col-xs-4">准牵引质量</label>' +
								'<div class="col-xs-8">' +
									'<input type="text" id="zqyzl" name="zqyzl" class="form-control '+ required +' decimal" '+ readonly +
										' data-fieldName="HGZ_ZQYZL"/>' +
								'</div>' +
							'</div>' +
						'</div>' +
						'<div class="col-xs-12 col-sm-6 col-md-4">' +
							'<div class="form-group">' +
								'<label class="control-label col-xs-4">准乘人数</label>' +
								'<div class="col-xs-8">' +
									'<input type="text" id="zcrs" name="zcrs" class="form-control '+ required +' digits" '+ readonly +
										' data-fieldName="HGZ_ZCRS"/>' +
								'</div>' +
							'</div>' +
						'</div>';
		}
			htmlStr += '<div class="col-xs-12 col-sm-6 col-md-4">' +
							'<div class="form-group">' +
								'<label class="control-label col-xs-4">轮胎</label>' +
								'<div class="col-xs-8">' +
									'<input type="text" id="ltgg" name="ltgg" class="form-control '+ required +'" '+ readonly +
										' data-fieldName="HGZ_LTGG"/>' +
								'</div>' +
							'</div>' +
						'</div>' +
						'</div>' +
						'<div class="row" >' +
							'<div class="col-xs-12 col-sm-12 col-md-12">' +
								'<div class="form-group">' +
									'<label class="control-label col-xs-1">其它要求</label>' +
									'<div class="col-xs-11">' +
										'<textarea id="hgzOtherDemand" name="hgzOtherDemand" class="form-control" '+ readonly +' maxlength="600" ' +
											 'data-fieldName="HGZ_OTHER_DEMAND" style="resize:none;">' +
										'</textarea>' +
									'</div>' +
								'</div>' +
							'</div>' +
							'<div class="col-xs-12 col-sm-12 col-md-12">' +
								'<div class="form-group">' +
									'<label class="control-label col-xs-1">备注</label>' +
									'<div class="col-xs-11">' +
										'<textarea id="hgzRemark" name="hgzRemark" class="form-control" '+ readonly +' maxlength="600" ' +
											 'data-fieldName="HGZ_REMARK" style="resize:none;">' +
										'</textarea>' +
									'</div>' +
								'</div>' +
							'</div>' +
						'</div>' +
					'</div></div></div>';
		$('#'+certificateSchablone.CommonParams['certificateDivId'], container).append($(htmlStr));
	}
	//生成不用手填合格证HTML
	var createNonHandFillCertificateHtml = function(container, template){
		var isDetailFlag = $(container).find(".dms-edit:first").attr("data-isDetailFlag");
		var required = (isDetailFlag && isDetailFlag == 'true') ? '':'required';
		var disabled = (isDetailFlag && isDetailFlag == 'true') ? 'disabled':'';
		var isQycFlag = false;
		if(template.hasOwnProperty("azzzl")){			//若存在鞍座载质量，则为牵引车模板。
			isQycFlag = true;
		}
		//存储生成模板结构化数据
		$('#pubModelCode', container).data('templateData', JSON.stringify(template));
		//生成html
		var htmlStr = '<div class="col-xs-12 col-sm-12 col-md-12">' +
						'<div class="panel panel-default">' +
						'<div class="panel-body">' +
						'<div class="row">' +
						'</div></div></div>';
		$('#'+certificateSchablone.CommonParams['certificateDivId'], container).append($(htmlStr));
		$.each(template, function(key, value){
			if(key == 'zzl') return ;			//总质量不生成元素
			fieldName = 'HGZ_' + key.toUpperCase();
			htmlStr = '<div class="col-xs-12 col-sm-6 col-md-4"><div class="form-group">' +
						  '<label class="control-label col-xs-4">'+certificateSchablone.nameSpace[key]+'</label>' + 
						  '<div class="col-xs-8">';
			//额定载质量和鞍座载质量生成空文本，后计算赋值。
			if('azzzl' == key || 'edzzl' == key){
				htmlStr += ('<input type="text" id="{0}" name="{0}" data-fieldName="{1}" class="form-control '+ required +'" readonly/>').format(key, fieldName);
			}else{
				if(isArray(value)){
					htmlStr += ('<select id="{0}" name="{0}" data-fieldName="{1}" class="form-control bs-select '+ required +'" '+ disabled +'>').format(key, fieldName);
					$.each(value, function(i, arrVal){
						if(arrVal){
							htmlStr += '<option value="{0}">{0}</option>'.format(arrVal);
						}
					});
					htmlStr += '</select>';
				}else{
					htmlStr += ('<input type="text" id="{0}" name="{0}" data-fieldName="{1}" value="{2}" class="form-control '+ required +'" readonly/>').format(key, fieldName, value);
				}
			}
			htmlStr += '</div></div></div>';
			var htmlObj = $(htmlStr);
			$('#'+certificateSchablone.CommonParams['certificateDivId'], container).find('.row').append(htmlObj);
			//下拉框初始化
			if(isArray(value)) {
				dmsDict.initObject(htmlObj.find('select'));
//				htmlObj.find('select').selectpicker('refresh');
			}
			bindNormalEvent(container, htmlObj, template, isQycFlag);
		});
		//生成其他要求，备注文本域
		var htmlStr = '<div class="col-xs-12 col-sm-12 col-md-12"><div class="form-group">' +
					  '<label class="control-label col-xs-1">其它要求</label>' + 
					  '<div class="col-xs-11">' +
					  '<textarea id="hgzOtherDemand" name="hgzOtherDemand" class="form-control" '+ disabled +' maxlength="600" ' +
					  'data-fieldName="HGZ_OTHER_DEMAND" style="resize:none;">' +
					  '</textarea>' +
					  '</div></div></div>';
			htmlStr += '<div class="col-xs-12 col-sm-12 col-md-12"><div class="form-group">' +
					  '<label class="control-label col-xs-1">备注</label>' + 
					  '<div class="col-xs-11">' +
					  '<textarea id="hgzRemark" name="hgzRemark" class="form-control" '+ disabled +' maxlength="600" ' +
					  'data-fieldName="HGZ_REMARK" style="resize:none;">' +
					  '</textarea>' +
					  '</div></div></div>';
					  
		var htmlObj = $(htmlStr);
		$('#'+certificateSchablone.CommonParams['certificateDivId'], container).find('.row').append(htmlObj);
		
		if(template['zbzl'] && !isArray(template['zbzl']) && template['zcrs'] && !isArray(template['zcrs'])){
			//若整备质量和准乘人数只有一个值，直接算出额定载质量和鞍座载质量。
			if(isQycFlag){
				var azzzlVal = template['zzl']*1 - template['zbzl']*1 - template['zcrs']*65; 
				$('#azzzl', container).val(azzzlVal);
			}else{
				var edzzlVal = template['zzl']*1 - template['zbzl']*1 - template['zcrs']*65; 
				$('#edzzl', container).val(edzzlVal);
			}
		}
	}
	//根据规则给元素绑定事件
	var bindNormalEvent = function(container, obj, template, isQycFlag){
		obj = obj.find('select').length > 0 ? obj.find('select'):obj.find('input');
		//额定载质量和鞍座载质量算法
		if('zbzl' == obj.prop('name') || 'zcrs' == obj.prop('name')){
			if(template['zbzl'] && !isArray(template['zbzl']) && template['zcrs'] && !isArray(template['zcrs'])){
				
			}else{
				obj.off('change.chen').on('change.chen', function(){
					var zzl = template['zzl'];
					var zcrsVal = $('#zcrs', container).val();
					var zbzlVal  = $('#zbzl', container).val();
					if(isArray(zzl)){
						zzl = zzl[0];
					}
					if(zbzlVal && zcrsVal){
						if(isQycFlag){
							var azzzlVal = zzl * 1 - zbzlVal * 1 - zcrsVal * 65;
							$('#azzzl', container).val(azzzlVal);
						}else{
							var edzzlVal = zzl * 1 - zbzlVal * 1 - zcrsVal * 65;
							$('#edzzl', container).val(edzzlVal);
						}
					}else{
						if(isQycFlag){
							$('#azzzl', container).val('');
						}else{
							$('#edzzl', container).val('');
						}
					}
				});
			}
		}
		//最高车速默认最高的值
		if('zgcs' == obj.prop('name') || 'zcrs' == obj.prop('name')){
			var maxVal = 0;
			obj.find('option').each(function(i, dom){
				var domVal = $(dom).text() * 1;
				if(maxVal <= domVal){
					maxVal = domVal;
				}
			});
			if(maxVal) obj.selectpicker('val', maxVal).change();
		}
		
	}
	//清除合格证列表 
	var clearCertificateTable = function(container){
		$('#'+certificateSchablone.CommonParams['certificateDivId'], container).html('');
	}
	//判断变量是否数组
	var isArray = function(o){
		
	    return Object.prototype.toString.call(o)=='[object Array]';
	}
	//判断是否为JSON对象
	var isJsonObj = function(o){
		
		return typeof(o) == "object" && Object.prototype.toString.call(o).toLowerCase() == "[object object]" && !o.length;  
	}
	//判断是否为JSON字符串
	var isJsonStr = function(o){
		try{
			if(!o)
				return false;
				
			if(typeof(JSON.parse(o)) != 'object')
				return false;

			return true;
		}catch(e){
			return false;  
		}
	}
	//克隆JSON
	var cloneJson = function(o){
		
		return JSON.parse(JSON.stringify(o));
	}
	//去除数组重复元素
	var uniqueArr = function(arr){
		var newArr = [];
		$.each(arr, function(i, arrItem){
			var isExisted = false;
			$.each(newArr, function(j, newArrItem){
				if(arrItem == newArrItem){
					isExisted = true;
				}
			});
			if(!isExisted){
				newArr.push(arrItem);
			}
		});
		
		return newArr;
	}
	//------------------------------------------------------合格证相关------------------------------------------------------//
	
	
	
	return {
		"createModelConfigStructure" : createModelConfigStructure,
		"addParentItemRow" : addParentItemRow,
		"addItemConfigRowTD" : addItemConfigRowTD,
		"addParentItemWithSubItemRow" : addParentItemWithSubItemRow,
		"onItemSelectChange" : onItemSelectChange,
		"doWithValueChangeCascade" : doWithValueChangeCascade,
		"sumRsItemPrice" : sumRsItemPrice,
		"sumTotalPrice" : sumTotalPrice,
		"commonOptions" : function(opname){
			if(opname)
				return commonOptions[opname];
			else
				return commonOptions;
		},
		"stringFormat" : stringFormat,
		"specialConfigItemChange" : specialConfigItemChange,
		"updateConfigTable" : updateConfigTable,
		"spliceConfigTable" : spliceConfigTable,
		"initConfigTable" : initConfigTable,
		"getOrderDeliveryCycle" : getOrderDeliveryCycle,
		"getOrderInSideCode" : getOrderInSideCode,
		"initCertificateTable" : initCertificateTable,
		"certificateSchablone" : function(name){
			if(name){
				return certificateSchablone[name];
			}
			return certificateSchablone;
		},
		"isArray" : isArray,
		"isJsonObj" : isJsonObj,
		"isJsonStr" : isJsonStr,
		"cloneJson" : cloneJson,
		"clearCertificateTable" : clearCertificateTable,
		"createCertificate" : createCertificate,
		"searchConfigTable" : searchConfigTable
	};
}();