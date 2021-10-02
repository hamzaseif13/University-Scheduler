from selenium import webdriver
from selenium.webdriver.support.ui import Select
import time

path="C:\Program Files (x86)\chromedriver.exe"
driver=webdriver.Chrome(path)
driver.get("https://services.just.edu.jo/courseschedule/default_en.aspx")

selectFaculty = Select(driver.find_element_by_id('ctl00_contentPH_ddlFaculty'))
selectFaculty.select_by_index(1)
time.sleep(2)

spans=driver.execute_script('return document.getElementsByTagName("span")[0].innerHTML;')
print(str(spans))
""" 

selectDep = Select(driver.find_element_by_id('ctl00_contentPH_ddlDept'))
selectDep.select_by_index(1)

f = open('webscrap/htmls/mid1.js', "a", encoding='utf-8')
pageSource = driver.execute_script("return document.body.innerHTML;")
#captha=driver.findElement(By.xpath("//div[@class='value test']"));
print(str(pageSource))
f.write("var hamza =`"+str(pageSource)+"`")
f.close() """


submit=driver.find_element_by_id("ctl00_contentPH_btnSubmit")




