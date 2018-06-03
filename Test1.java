package java_webtest;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.text.SimpleDateFormat;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.util.CellReference;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.microsoft.schemas.office.visio.x2012.main.CellType;

public class Test1 implements Runnable {
	Socket client;

	public Test1(String name, Socket client) {
		this.client = client;
		new Thread(this, name).start();
	}

	public static void main(String[] args) throws IOException, InvalidFormatException {
		File excel = new File("C:/Users/Administrator/Desktop/test.xlsx");
		XSSFWorkbook wb = new XSSFWorkbook(excel);
		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		DataFormatter formatter = new DataFormatter();
		Sheet sheet1 = wb.getSheetAt(0);
		CellStyle newStyle = wb.createCellStyle();
		newStyle.setDataFormat(wb.createDataFormat().getFormat("yyyy-mm-dd hh:mm:ss"));
		for (Row row : sheet1) {
			for (Cell cell : row) {
				System.out.print("----------cellRef:");
				CellReference cellRef = new CellReference(row.getRowNum(), cell.getColumnIndex());
				System.out.print(cellRef.formatAsString());
				System.out.print("  -------cellValue:");
				// CellStyle newStyle = wb.createCellStyle();
				// newStyle.setDataFormat((short) ++i);
				// cell.setCellStyle(newStyle);
				// try {
				if (DateUtil.isCellDateFormatted(cell)) {
					cell.setCellStyle(newStyle);
					cell.setCellType(cell.CELL_TYPE_NUMERIC);
				} else if (cell.getCellType() == Cell.CELL_TYPE_FORMULA)
					switch (cell.getCachedFormulaResultType()) {
					case 0:
						cell.setCellType(cell.CELL_TYPE_NUMERIC);
						break;
					case 1:
						cell.setCellType(cell.CELL_TYPE_STRING);
						break;
					}
				System.out.print(formatter.formatCellValue(cell));
				// } catch (Exception e) {
				// // TODO: handle exception
				// System.out.println(e);
				// }
				// System.out.println(formatter.formatCellValue(cell));
				// switch (cell.getCellType()) {
				// case Cell.CELL_TYPE_STRING:
				//
				// break;
				// case Cell.CELL_TYPE_NUMERIC:
				//// cell.setCellStyle(wb.getCellStyleAt(0));
				//
				// break;
				// case Cell.CELL_TYPE_FORMULA:
				//
				// break;
				//
				// default:
				// break;
				// }
				System.out.println(" ---------cellFormatString:"+cell.getCellStyle().getDataFormatString());
			}
		}
		wb.write(new FileOutputStream("C:/Users/Administrator/Desktop/test2.xlsx"));
		wb.close();
	}

	@Override
	public void run() {
		System.out.println("start:" + Thread.currentThread().getName());
		InputStream rd;
		try {
			String response = "HTTP/1.1 200 OK\nServer:zpf\nContent-Type: text/html\nContent-Length:0\r\n\r\n";
			OutputStream out = client.getOutputStream();
			out.write(response.getBytes("utf-8"));
			out.flush();
			rd = client.getInputStream();
			int n = 0;
			byte[] buf = new byte[200];
			client.setSoTimeout(5000);
			while ((n = rd.read(buf)) != -1)
				System.out.println(new String(buf, 0, n, "utf-8"));
			client.close();
		} catch (IOException e) {
			System.out.println("time_out");
		}
		System.out.println(Thread.currentThread().getName() + ": out");
	}
}
