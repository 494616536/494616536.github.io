
/** 
*Copyright 2016 Yonyou Corporation Ltd. All Rights Reserved.
* This software is published under the terms of the Yonyou Software
* License version 1.0, a copy of which has been included with this
* distribution in the LICENSE.txt file.
*
* @Project Name : dms.web
*
* @File name : DictController.java
*
* @Author : rongzoujie
*
* @Date : 2016年7月13日
*
----------------------------------------------------------------------------------
*     Date       Who       Version     Comments
* 1. 2016年7月13日    rongzoujie    1.0
*
*
*
*
----------------------------------------------------------------------------------
*/
package com.dms.web.controller.basedata;

import java.io.IOException;
import java.lang.annotation.Annotation;
import java.lang.reflect.InvocationTargetException;
import java.sql.Connection;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.javalite.activejdbc.Base;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.MethodParameter;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.condition.PatternsRequestCondition;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;
import com.dms.framework.DAO.PageInfoDto;
import com.dms.framework.domain.RequestPageInfoDto;
import com.dms.framework.service.excel.ExcelDataType;
import com.dms.framework.service.excel.ExcelExportColumn;
import com.dms.framework.service.excel.ExcelGenerator;
import com.dms.framework.util.bean.AppliactionContextHelper;
import com.dms.framework.util.bean.ApplicationContextHelper;
import com.dms.function.common.CommonConstants;
import com.dms.function.utils.jsonSerializer.JSONUtil;
import com.f4.mvc.annotation.TxnConn;
import com.f4.mvc.controller.BaseController;
import com.itextpdf.text.DocumentException;

@Controller
@TxnConn
@RequestMapping("/common/exportXls")
public class CommonExportXlsController extends BaseController{
	private static final Logger logger=LoggerFactory.getLogger(CommonExportXlsController.class);
	private Connection conn=null;

	/**
	 * 描述：导出excel
	 * 
	 * @date 2018年7月15日
	 * @author ZPF
	 * @param param
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	@SuppressWarnings({"rawtypes","unchecked"})
	@RequestMapping(value="/export")
	public void exportXls(@RequestParam Map param,HttpServletRequest request,HttpServletResponse response) throws Exception{
		exportData(param,request,response);
	}

	@SuppressWarnings({"unchecked","rawtypes"})
	public void exportData(Map<String,Object> queryParam,HttpServletRequest request,HttpServletResponse response) throws DocumentException,IOException{
		ExcelGenerator excelService=AppliactionContextHelper.getBeanByType(ExcelGenerator.class);
		Map data=JSONUtil.jsonToMap((String) queryParam.get("data")),tableInfo=(Map) data.get("tableInfo");
		List<Map> resultList=getExportData(data,request,response);
		if(conn!=null)Base.attach(conn);
		List<String> field=(List<String>) tableInfo.get("field"),title=(List<String>) tableInfo.get("title");
		List dict=(List) tableInfo.get("dict"),date=(List) tableInfo.get("date");
		Map<String,List<Map>> excelData=new HashMap<String,List<Map>>();
		String fileName=(String) data.get("fileName");
		excelData.put(fileName,resultList);
		List<ExcelExportColumn> exportColumnList=new ArrayList<ExcelExportColumn>();
		int i=0,n=field.size();
		for(;i<n;i++){
			if((int) dict.get(i)==1)
				exportColumnList.add(new ExcelExportColumn(field.get(i),title.get(i),ExcelDataType.Dict));
			else if(!"".equals(date.get(i))){
				String format=(String) date.get(i),ft=CommonConstants.SIMPLE_DATE_FORMAT;
				if(format.contains("HH:mm"))
					ft=CommonConstants.SIMPLE_DATE_TIME_FORMAT;
				exportColumnList.add(new ExcelExportColumn(field.get(i),title.get(i),ft));
			}else
				exportColumnList.add(new ExcelExportColumn(field.get(i),title.get(i)));
		}
		if(resultList.size()>0)logger.debug("\n自动导出数据获取成功，如果导出失败是数据问题或dict初始化有问题！数据条数："+resultList.size()+"条");
		excelService.generateExcel(excelData,exportColumnList,fileName+".xls",request,response);
	}

	@SuppressWarnings("rawtypes")
	private List<Map> getExportData(Map<String,Object> queryParam,HttpServletRequest request,HttpServletResponse response){
		RequestMappingHandlerMapping handlerMapping=AppliactionContextHelper.getBeanByType(RequestMappingHandlerMapping.class);
		Map<RequestMappingInfo,HandlerMethod> map=handlerMapping.getHandlerMethods();
		String tableUrl=(String) queryParam.get("tableUrl"),model="."+queryParam.get("requestModel")+".";
		for(int i=0;i<2;i++)
			for(Map.Entry<RequestMappingInfo,HandlerMethod> m :map.entrySet()){
				RequestMappingInfo info=m.getKey();
				HandlerMethod method=m.getValue();
				PatternsRequestCondition p=info.getPatternsCondition();
				if(!method.getBeanType().getName().contains(model))
					continue;
				for(String url :p.getPatterns()){
					String[] backstage=url.split("/"),front=tableUrl.split("/");
					HashMap<String,String> value=new HashMap<String,String>();
					if(i==0&&url.equals(tableUrl))
						return invokeHandlerMethod(value,queryParam,request,response,method);
					else if(i==1){
						if(compareUrl(backstage,front,value)==1)
							return invokeHandlerMethod(value,queryParam,request,response,method);
					}
				}
			}
		return null;
	}

	private int compareUrl(String[] backstage,String[] front,HashMap<String,String> value){
		int n=backstage.length;
		if(n<front.length&&backstage[n-1].equals("*")){
			for(int i=0;i<n;i++)
				if(backstage[i].equals(front[i]))
					continue;
				else if(backstage[i].equals("*"))
					return 1;
				else
					return -1;
		}else if(n==front.length){
			for(int i=0;i<n;i++)
				if(backstage[i].equals(front[i]))
					continue;
				else if(backstage[i].contains("{")){
					value.put(backstage[i],front[i]);
					if(i==n-1)
						return 1;
				}else
					return -1;
		}
		return -1;

	}

	@SuppressWarnings({"rawtypes","unchecked"})
	private List<Map> invokeHandlerMethod(HashMap<String,String> value,Map<String,Object> queryParam,HttpServletRequest request,HttpServletResponse response,HandlerMethod method){
		RequestPageInfoDto requestPageInfoDto=ApplicationContextHelper.getBeanByType(RequestPageInfoDto.class);
		requestPageInfoDto.setLimit((String) queryParam.get("limit"));
		requestPageInfoDto.setOffset((String) queryParam.get("offset"));
		requestPageInfoDto.setSort((String) queryParam.get("sort"));
		requestPageInfoDto.setOrder((String) queryParam.get("order"));
		MethodParameter[] params=method.getMethodParameters();
		queryParam.remove("tableInfo");
		Object[] args=new Object[params.length];
		int i=0;
		for(MethodParameter parameter :params){
			Class<?> type=parameter.getParameterType();
			Annotation[] paramAnns=parameter.getParameterAnnotations();
			for(Annotation paramAnn :paramAnns){
				if(RequestParam.class.isInstance(paramAnn)||RequestBody.class.isInstance(paramAnn)){
					args[i]=queryParam;
				}else if(PathVariable.class.isInstance(paramAnn)){
					PathVariable pathVar=(PathVariable) paramAnn;
					String pathVarName="{"+pathVar.value()+"}";
					Object val;
					if(type.isAssignableFrom(Integer.class))
						val=Integer.parseInt(value.get(pathVarName));
					else if(type.isAssignableFrom(Long.class))
						val=Long.parseLong(value.get(pathVarName));
					else if(type.isAssignableFrom(Double.class))
						val=Double.parseDouble(value.get(pathVarName));
					else if(type.isAssignableFrom(Float.class))
						val=Float.parseFloat(value.get(pathVarName));
					else
						val=value.get(pathVarName);
					args[i]=val;

				}

			}
			if(type.isAssignableFrom(HttpServletRequest.class))
				args[i]=request;
			else if(type.isAssignableFrom(HttpServletResponse.class))
				args[i]=response;
			i++;
		}
		Object result=null;
		conn=Base.detach();
		try{
			result=method.getMethod().invoke(AppliactionContextHelper.getBeanByType(method.getBeanType()),args);
		}catch(IllegalAccessException|IllegalArgumentException|InvocationTargetException e){
			e.printStackTrace();
		}
		if(method.getMethod().getReturnType().isAssignableFrom(PageInfoDto.class))
			return ((PageInfoDto) result).getRows();

		return (List<Map>) result;
	}
}
