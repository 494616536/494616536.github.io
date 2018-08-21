
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
import java.io.OutputStream;
import java.lang.annotation.Annotation;
import java.sql.Connection;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.poi.hssf.util.HSSFColor;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.util.RegionUtil;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
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
import com.dms.framework.util.http.FrameHttpUtil;
import com.dms.function.common.CommonConstants;
import com.dms.function.exception.ServiceBizException;
import com.dms.function.exception.UtilException;
import com.dms.function.utils.common.CommonUtils;
import com.dms.function.utils.common.StringUtils;
import com.dms.function.utils.io.IOUtils;
import com.dms.function.utils.jsonSerializer.JSONUtil;
import com.f4.mvc.annotation.TxnConn;
import com.f4.mvc.controller.BaseController;
import com.itextpdf.text.DocumentException;
import com.sun.org.apache.bcel.internal.generic.NEW;

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
		if(!Base.hasConnection())
			Base.attach(conn);
		List<String> field=(List<String>) tableInfo.get("field"),title=(List<String>) tableInfo.get("title");
		List dict=(List) tableInfo.get("dict"),numFt=(List) tableInfo.get("numFt"),rowspan=(List) tableInfo.get("rowspan"),colspan=(List) tableInfo.get("colspan");
		Map<String,List<Map>> excelData=new HashMap<String,List<Map>>();
		String fileName=(String) data.get("fileName");
		excelData.put(fileName,resultList);
		List<ExcelExportColumn> exportColumnList=new ArrayList<ExcelExportColumn>();
		List<Map> extra=new ArrayList<Map>();
		HashSet<Object> rowLen=new HashSet<Object>();
		exportColumnList.add(new ExcelExportColumn("_ROWNUM","序号"));
		for(int i=0,n=field.size();i<n;i++){
			String caption[]=title.get(i).split("##"),capt=caption[0];
			if(caption.length>1){
				capt=caption[1];
				rowLen.add(caption[0]);
			}
			HashMap<String,Object> map=new HashMap<String,Object>();
			map.put("rowNum",Integer.parseInt(caption[0]));
			map.put("rowspan",rowspan.get(i));
			map.put("colspan",colspan.get(i));
			extra.add(map);
			if(dict.get(i).toString().equals("1"))
				exportColumnList.add(new ExcelExportColumn(field.get(i),capt,ExcelDataType.Dict));
			else if(!StringUtils.isNullOrEmpty(numFt.get(i)))
				exportColumnList.add(new ExcelExportColumn(field.get(i),capt,(String) numFt.get(i)));
			else
				exportColumnList.add(new ExcelExportColumn(field.get(i),capt));
		}
		extra.add(0,JSONUtil.jsonToMap("{\"rowNum\":0,\"rowspan\":"+rowLen.size()+",\"colspan\":1}"));
		if(resultList.size()>0)
			logger.debug("\n自动导出数据获取成功，如果导出失败是数据问题或dict初始化有问题！数据条数："+resultList.size()+"条");
		// excelService.generateExcel(excelData,exportColumnList,fileName+".xls",request,response);
		generateXlsxExcel(extra,exportColumnList,excelData,fileName+".xlsx",request,response);
	}

	@SuppressWarnings("rawtypes")
	private List<Map> getExportData(Map<String,Object> queryParam,HttpServletRequest request,HttpServletResponse response){
		RequestMappingHandlerMapping handlerMapping=AppliactionContextHelper.getBeanByType(RequestMappingHandlerMapping.class);
		Map<RequestMappingInfo,HandlerMethod> map=handlerMapping.getHandlerMethods();
		String tableUrl=(String) queryParam.get("tableUrl"),model="."+queryParam.get("requestModel")+".",queryMethod=(String) queryParam.get("queryMethod");
		for(int i=0;i<2;i++)
			for(Map.Entry<RequestMappingInfo,HandlerMethod> m :map.entrySet()){
				RequestMappingInfo info=m.getKey();
				HandlerMethod method=m.getValue();
				PatternsRequestCondition p=info.getPatternsCondition();
				String type=info.getMethodsCondition().toString();
				if(type!=null&&type.startsWith("[")&&type.endsWith("]")){
					type=type.substring(1,type.length()-1);
				}
				if(!method.getBeanType().getName().contains(model)||!(StringUtils.isNullOrEmpty(type)||type.equals(queryMethod)))
					continue;
				for(String url :p.getPatterns()){
					String[] backstage=url.split("/"),front=tableUrl.split("/");
					HashMap<String,String> value=new HashMap<String,String>();
					if(i==0&&url.equals(tableUrl)){
						return invokeHandlerMethod(value,queryParam,request,response,method);
					}else if(i==1){
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
		}catch(Exception e){
			e.printStackTrace();
		}
		if(method.getMethod().getReturnType().isAssignableFrom(PageInfoDto.class))
			return ((PageInfoDto) result).getRows();

		return (List<Map>) result;
	}

	private void generateXlsxExcel(List<Map> extra,List<ExcelExportColumn> columnDefineList,Map<String,List<Map>> excelData,String fileName,HttpServletRequest request,HttpServletResponse response){
		// 如果excelData 中没有数据，则返回错误
		if(CommonUtils.isNullOrEmpty(excelData)){
			throw new ServiceBizException("No excel data !");
		}

		Workbook workbook=null;
		OutputStream outputStream=null;
		try{
			// 初始化输出流
			FrameHttpUtil.setExportFileName(request,response,fileName);
			outputStream=response.getOutputStream();
			// 初始化workbook
			workbook=new XSSFWorkbook();

			Set<String> sheetSet=excelData.keySet();
			for(String sheetName :sheetSet){
				@SuppressWarnings("rawtypes")
				List<Map> rowList=excelData.get(sheetName);
				// 创建sheet 页
				Sheet sheet=workbook.createSheet(sheetName);
				// 生成标题
				int n=generateTitleRow(sheet,columnDefineList,extra);

				// 生成数据
				generateDataRows(sheet,rowList,columnDefineList,n);

				// 当数据加载完成后设置sheet 格式
				setSheetFinishStyle(sheet,columnDefineList.size(),n+1);
			}
			workbook.write(outputStream);
		}catch(Exception exception){
			logger.warn(exception.getMessage(),exception);
			throw new ServiceBizException(exception.getMessage(),exception);
		}finally{
			IOUtils.closeStream(workbook);
			IOUtils.closeStream(outputStream);
		}

	}

	private int generateTitleRow(Sheet sheet,List<ExcelExportColumn> columnDefineList,List<Map> extra){
		// 修改字段样式
		Font font=getDefaultFont(sheet.getWorkbook());
		font.setFontHeightInPoints((short) 12); // 字体高度
		font.setBold(true); // 宽度

		// 修改默认单元格样式
		CellStyle cellStyle=getDefaultCellStyle(sheet.getWorkbook());
		cellStyle.setAlignment(HorizontalAlignment.CENTER);
		cellStyle.setFont(font);
		cellStyle.setFillForegroundColor(IndexedColors.PALE_BLUE.getIndex());
		cellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
		// 生成标题
		Row row=null;
		int num=-1,colNum=0;
		Long bitMap[]={0l,0l,0l,0l,0l,0l,0l};// 最多支持7行标题
		for(int m=0;m<columnDefineList.size();m++){
			Integer rowNum=(Integer) extra.get(m).get("rowNum"),colspan=(Integer) extra.get(m).get("colspan"),rowspan=(Integer) extra.get(m).get("rowspan");
			if(rowNum!=num){
				row=sheet.getRow(rowNum)==null ? sheet.createRow(rowNum):sheet.getRow(rowNum);
				colNum=0;
			}
			// 设置参数
			int n=setBitMap(bitMap,rowNum,colNum,colspan);
			if(rowspan!=null)
				for(int k=1;k<rowspan;k++){
					setBitMap(bitMap,rowNum+k,colNum,colspan);
				}
			Cell cell=row.createCell(n);
			cell.setCellValue(columnDefineList.get(m).getTitle());
			cell.setCellStyle(cellStyle);
			colNum=n+(colspan==null ? 1:colspan);
			if(colspan!=null||rowspan!=null){
				int x,y,cspan=colspan==null ? 1:colspan,rspan=rowspan==null ? 1:rowspan;
				// 为了完美的边框，其实这行个循环可以不用
				for(int i=rowNum;i<rspan+rowNum;i++){
					Row tRow=sheet.getRow(i)==null ? sheet.createRow(i):sheet.getRow(i);
					for(int a=i==rowNum ? 1:0;a<cspan;a++)
						tRow.createCell(n+a).setCellStyle(cellStyle);

				}
				x=colspan==null ? n:n+colspan-1;
				y=rowspan==null ? rowNum:rowNum+rowspan-1;
				CellRangeAddress region=new CellRangeAddress(rowNum,y,n,x);
//				RegionUtil.setBorderLeft(BorderStyle.THIN,region,sheet);
//				RegionUtil.setBorderRight(BorderStyle.THIN,region,sheet);
//				RegionUtil.setBorderTop(BorderStyle.THIN,region,sheet);
//				RegionUtil.setBorderBottom(BorderStyle.THIN,region,sheet);
				sheet.addMergedRegion(region);
			}
			num=rowNum;
		}

		return num;
	}

	private int setBitMap(Long[] bitMap,Integer rowNum,Integer colNum,Integer colspan){
		Long rowMap=bitMap[rowNum],t=rowMap&(1l<<colNum),d=0l;
		int res=0;
		colspan=colspan==null ? 1:colspan;
		if(t==0){
			res=colNum;
			for(int i=0;i<colspan;i++)
				d+=1l<<(colNum+i);
			bitMap[rowNum]=rowMap|d;
		}else
			for(int i=1;i<64-colNum;i++){
				t=rowMap&(1l<<(colNum+i));
				if(t==0){
					res=colNum+i;
					for(int j=0;j<colspan;j++)
						d+=1l<<(colNum+j+i);
					bitMap[rowNum]=rowMap|d;
					break;
				}
			}
		return res;
	}

	private void generateDataRows(Sheet sheet,List<Map> rowList,List<ExcelExportColumn> columnDefineList,int n){
		// TODO Auto-generated method stub

	}

	private void setSheetFinishStyle(Sheet sheet,int size,int n){
		// 设置字段宽度
		for(int i=0;i<size;i++){
			sheet.autoSizeColumn((short) i,true);
			// sheet.setColumnWidth(i, 4000);
		}

		// 冻结首行
		sheet.createFreezePane(0,n,0,n);

	}

	/**
	 * 
	 * 获得默认的字体
	 * 
	 * @author zhangxc
	 * @date 2016年9月28日
	 * @return
	 */
	private CellStyle getDefaultCellStyle(Workbook workbook){
		CellStyle cellStyle=workbook.createCellStyle();
		cellStyle.setAlignment(HorizontalAlignment.LEFT); // 水平布局：居中
		cellStyle.setVerticalAlignment(VerticalAlignment.CENTER);// 上下居中
		cellStyle.setBorderTop(BorderStyle.THIN); // 设置边框
		cellStyle.setBorderBottom(BorderStyle.THIN); // 设置边框
		cellStyle.setBorderLeft(BorderStyle.THIN); // 设置边框
		cellStyle.setBorderRight(BorderStyle.THIN); // 设置边框
		cellStyle.setWrapText(false);
		return cellStyle;
	}

	/**
	 * 
	 * 获得默认的字体
	 * 
	 * @author zhangxc
	 * @date 2016年9月28日
	 * @return
	 */
	private Font getDefaultFont(Workbook workbook){
		Font font=workbook.createFont();
		font.setFontHeightInPoints((short) 10); // 字体高度
		font.setColor(Font.COLOR_NORMAL); // 字体颜色
		font.setFontName("微软雅黑"); // 字体
		// font.setItalic(true); //是否使用斜体
		return font;
	}
}
