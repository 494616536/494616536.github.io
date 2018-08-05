
/** 
*Copyright 2016  Corporation Ltd. All Rights Reserved.
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

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import com.dms.framework.DAO.DAOUtil;
import com.dms.framework.util.FrameworkUtil;
import com.dms.framework.util.http.FrameHttpUtil;
import com.dms.function.exception.UtilException;
import com.dms.function.utils.jsonSerializer.JSONUtil;
import com.f4.mvc.annotation.TxnConn;
import com.f4.mvc.controller.BaseController;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.Image;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.BaseFont;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

@Controller
@TxnConn
@RequestMapping("/common/printPdf")
public class CommonPrintPdfController extends BaseController{
	private static final Logger logger=LoggerFactory.getLogger(CommonPrintPdfController.class);

	// private static Map beansOfType =
	// AppliactionContextHelper.getBeansOfType(ExcelExport.class);
	/**
	 * 描述：打印
	 * 
	 * @date 2018年7月10日
	 * @author ZPF
	 * @param param
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	@SuppressWarnings({"rawtypes","unchecked"})
	@RequestMapping(value="/print")
	public void exportPdf(@RequestParam Map param,HttpServletRequest request,HttpServletResponse response) throws Exception{
		drawSpecialorderPdf(param,request,response);
	}

	public void drawSpecialorderPdf(Map<String,Object> drawParam,HttpServletRequest request,HttpServletResponse response) throws DocumentException,IOException{
		Map<String,Object> data=JSONUtil.jsonToMap((String) drawParam.get("data"));
		String fileName=(String) data.get("name"),fontName=(String) data.get("fontName");
		try{
			FrameHttpUtil.setExportFileName(request,response,fileName+".pdf");
		}catch(Exception e){
			throw new UtilException("pdf 流初始化失败",e);
		}
		// 获取输出流将对象写入输出流
		Document document=new Document(PageSize.A4,10,10,15,50);
		PdfWriter writer=PdfWriter.getInstance(document,response.getOutputStream());
		Rectangle rect=new Rectangle(36,54,559,788);
		rect.setBorderColor(BaseColor.BLACK);
		writer.setBoxSize("art",rect);

		BaseFont bfChinese;
		String rootDir=request.getSession().getServletContext().getRealPath("/");
		if (!rootDir.endsWith(File.separator)) { rootDir =rootDir + java.io.File.separator; }
		try{
			fontName=rootDir+"assets"+File.separator+"fonts"+File.separator+fontName;
			bfChinese=BaseFont.createFont(fontName,BaseFont.IDENTITY_H,BaseFont.NOT_EMBEDDED);
		}catch(Exception e){
			bfChinese=BaseFont.createFont("STSongStd-Light","UniGB-UCS2-H",BaseFont.NOT_EMBEDDED);
		}
		Font codeFont=new Font(bfChinese,12,Font.NORMAL);
		Font mianFont=new Font(bfChinese,17,Font.NORMAL);
		Font tableFont=new Font(bfChinese,10,Font.NORMAL);
		Image img = Image.getInstance(rootDir+"assets/pages/img/logon_sx.png");  
    img.setAlignment(Image.BOTTOM);  
    img.setBorderColor(BaseColor.WHITE);  
    img.scaleToFit(150, 50);// 大小  

		document.open();
		PdfPTable header=new PdfPTable(3);
		 PdfPCell imgCell=new PdfPCell(img);  
		 imgCell.setBorder(Rectangle.NO_BORDER);// 无边框  
		 imgCell.setBorderWidth(0);// 无边框  
		header.addCell(imgCell);
		header.addCell(createCell(fileName,mianFont,Element.ALIGN_CENTER,0,0f,1,null));
		header.addCell(createCell("打印人："+FrameworkUtil.getLoginInfo().getUserName(),tableFont,Element.ALIGN_RIGHT,0,0f,1,null));
		header.getDefaultCell().setBorder(PdfPCell.NO_BORDER);
		PdfPTable table=new PdfPTable(1);
		// 主框架表
		table.getDefaultCell().setBorder(PdfPCell.NO_BORDER);
		table.setWidthPercentage(100);
		table.setHorizontalAlignment(Element.ALIGN_CENTER);
		table.addCell(header);
		List type=(List) data.get("type"),panel=(List) data.get("panel"),rows=(List) data.get("rows");
		for(int i=0,n=type.size();i<n;i++){
			Integer flag=(Integer) type.get(i);
			Map panelData=(Map) rows.get(i);
			List dataList=(List) panelData.get("list");
			List<String> namelist=(List) panelData.get("name");
			if(!panel.get(i).equals("信息"))
				table.addCell(createCell(panel.get(i),codeFont,Element.ALIGN_LEFT,0,20f,1,BaseColor.LIGHT_GRAY));
			table.addCell(returnTable(tableFont,dataList,namelist,flag));
			if(!panel.get(i<n-1 ? i+1:i).equals("信息"))
				table.addCell(createCell(null,tableFont,Element.ALIGN_CENTER,0,0f,6,null));
		}

		document.add(table);
		document.close();
	}

	private PdfPTable returnTable(Font tableFont,List data,List<String> namelist,int flag){
		PdfPTable table=null;
		int n=namelist.size(),total=0;
		if(n==0)
			return null;
		if(flag==0){
			table=new PdfPTable(new float[]{4,6,4,6,4,6});
			for(int i=0,sp=1;i<n;i++){
				String name=namelist.get(i);
				Map dataMap=(Map) data.get(0);
				String value=(String) dataMap.get(name);
				if("".equals(name)||n==1){
					table.addCell(createCell(name+" "+value,tableFont,Element.ALIGN_RIGHT,0,0f,6,null));
					continue;
				}
				if(value.length()>50){
					sp=5;
					if(total!=0)
						for(int j=0;j<6-total;j++)
							table.addCell(createCell(null,tableFont,Element.ALIGN_LEFT,0,0f,1,null));
				}else
					sp=1;
				total+=1+sp;
				if(total==6)
					total=0;
				table.addCell(createCell(name,tableFont,Element.ALIGN_LEFT,0,0f,1,null));
				table.addCell(createCell(value,tableFont,Element.ALIGN_LEFT,0,0f,sp,null));
			}
			for(int i=0;i<6-total;i++)
				table.addCell(createCell(null,tableFont,Element.ALIGN_CENTER,0,0f,1,null));
		}else{
			for(int k=0;k<n;k++){
				if(namelist.get(k).equals("操作")){
					namelist.remove(k);
					n--;
					continue;
				}
			};
			table=new PdfPTable(n);
			for(String name :namelist)
				table.addCell(createCell(name,tableFont,Element.ALIGN_CENTER,1,0f,1,null));
			for(int i=0;i<data.size();i++){
				Map row=(Map) data.get(i);
				for(String name :namelist)
					table.addCell(createCell(row.get(name),tableFont,Element.ALIGN_CENTER,1,0f,1,null));
			}
		}
		return table;
	}

	// 根据TC_CODE查询中文名称
	public static String typeName(Object id){
		String name=null;
		StringBuilder Sql=new StringBuilder();
		Sql.append("SELECT T.CODE_CN_DESC FROM TC_CODE T WHERE T.CODE_ID='"+id+"'");
		if(id!=null){
			name=DAOUtil.findValue(Sql.toString(),null).toString();
		}
		return name;
	}

	/**
	 * 非空处理
	 * 
	 * @param value
	 * @return
	 */
	public static String getBlank(Object value){
		if(value!=null){
			return value.toString();
		}
		return " ";
	}

	/**
	 * 创建单元格
	 * 
	 * @author CJN
	 * @date 2017年11月2日
	 * @param value
	 *          显示内容
	 * @param font
	 *          字体
	 * @param align
	 *          对齐方式
	 * @param border
	 *          边框宽度
	 * @param height
	 *          单元格高度
	 * @param baseColor
	 *          单元格背景颜色
	 * @return PdfPCell
	 */
	public static PdfPCell createCell(Object value,Font font,Integer align,Integer border,Float height,Integer colspan,BaseColor baseColor){
		PdfPCell cell=new PdfPCell();
		cell.setHorizontalAlignment(align);
		cell.setPhrase(new Phrase(getBlank(value),font));
		cell.setFixedHeight(height);
		cell.setBorderWidth(border);
		cell.setColspan(colspan);
		cell.setBackgroundColor(baseColor);
		return cell;
	}

}
