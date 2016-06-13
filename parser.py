import requests
import time
import bs4
import MySQLdb

def HTMLParse(sessionid='', term=''):
    f = open('prof.txt', 'r')
    cnt = 0
    s = requests.session()
    while True:
        cnt += 1
        line = f.readline()

        if not line:
            break
        line = line.strip()
        url = 'http://www.irp.gatech.edu/reports/grades_by_instructorsmry.php?cmd=search&sv_INSTRUCTOR='+line+'&sv_TERM_CODE='+term+'&Submit=Search'
        cookie = {'PHPSESSID': sessionid}
        while True:
            try:
                response = s.get(url, cookies=cookie)
                #print (response.text)
                if line == '., Varun':
                    line = 'Varun'
                f2 = open("prof/" + line + ".html", 'w+')
                f2.write(response.text)
                f2.close()
                print "(No. "+str(cnt)+") Professor " + line + " has been processed"
                time.sleep(5)
            except:
                pass
            else:
                break
    f.close()
def ParseInfo():
    db = MySQLdb.connect("localhost","root","~!Honeycomb0904!@","honeycomb_critique")
    cursor = db.cursor()
    f = open('prof.txt', 'r')
    cnt = 0
    while True:
        cnt += 1
        line = f.readline()
        if not line:
            break
        line = line.strip()
        print "(No. "+str(cnt)+") Professor " + line
        if line == '., Varun':
            line = 'Varun'
        f2 = open('prof/' + line + ".html")
        response = f2.read()
        response = response.split('<div class="ewGridMiddlePanel">')[1]
        soup = bs4.BeautifulSoup(response, 'html.parser')
        codes = soup.select('table.ewTableSeparate.ewTableSeparate tbody tr')
        #BREAK AT 12
        semester = ''
        for code in codes:
            soup2 = bs4.BeautifulSoup(str(code), 'html.parser')
            tds = soup2.select('td')
            ind = -1
            title = ['Instructor', 'Term', 'Course', 'A','B','C','D','F','S','U','I','W','V','TOTAL']
            courseData = []
            printable = True
            printlog = ""
            for td in tds:
                ind += 1
                if ind == 13:
                    break
                soup3 = bs4.BeautifulSoup(str(td), 'html.parser')
                try:
                    data = str(soup3.select('span')[0])
                except:
                    #skip the case
                    printable = False
                    break

                if ind != 2:
                    data = data.replace('<span>', '')
                    data = data.replace('</span>', '')
                    if ind is 0:
                        data = line
                    if ind is 1:
                        datatmp = data.split(' - ')
                        data = datatmp[0]
                        data = data.strip()
                        if len(datatmp) is 2 and data != semester:
                            semester = data
                        data = semester
                    if ind != 0:
                        printlog = printlog + " / "
                    printlog = printlog + title[ind] + " : " + data
                    if ind >= 3:
                        data = int(data)
                    courseData.append(data)
                else:
                    soup4 = bs4.BeautifulSoup(data, 'html.parser')
                    data = str(soup4.select('a strong')[0])
                    data = data.replace('<strong>', '')
                    data = data.replace('</strong>', '')
                    CourseInfo = data.split(' ')
                    printlog = printlog + " / "
                    printlog = printlog + title[ind] + " : " + CourseInfo[0] + " " + CourseInfo[1] + " / Section : " + CourseInfo[2]
                    courseData.append(CourseInfo[0])
                    courseData.append(CourseInfo[1])
                    courseData.append(CourseInfo[2])

            if printable:
                courseDataTuple = tuple(courseData)
                print (printlog)
                #store to db
                sql = "insert into grade_distribution (instructor, term, courseDept, courseNum, section, A, B, C, D, F, S, U , I, W, V) values(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
                try:
                    # Execute the SQL command
                    cursor.execute(sql, courseDataTuple)
                    # Commit your changes in the database
                    db.commit()
                except Exception, e:
                    print(e)
                    print("db error")
                    db.rollback()


        f2.close()
    f.close()
    db.close()
def parseCourseName():
    f = open('courselist.txt', 'r')
    db = MySQLdb.connect("localhost","root","~!Honeycomb0904!@","honeycomb_critique")
    cursor = db.cursor()
    cnt = 0
    s = requests.session()
    while True:
        cnt += 1
        line = f.readline()
        if cnt <= 1031:
            continue
        if not line:
            break
        line = line.strip()
        courseDept = line.split(' ')[0]
        courseNum = line.split(' ')[1]
        url = 'https://oscar.gatech.edu/pls/bprod/bwckctlg.p_disp_course_detail?cat_term_in=201608&subj_code_in='+courseDept+'&crse_numb_in='+courseNum
        while True:
            try:
                response = s.get(url)
                soup = bs4.BeautifulSoup(response.text, 'html.parser')
                codes = soup.select('.nttitle')
                courseTitle = str(codes[0]).split(" - ")[1].split("</td>")[0]
                print str(cnt) + " " + (courseTitle)
                sql = "update course SET title= %s where courseDept = %s and courseNum = %s"
                courseData = [courseTitle, courseDept, courseNum]
                courseDataTuple = tuple(courseData)
                try:
                    # Execute the SQL command
                    cursor.execute(sql, courseDataTuple)
                    # Commit your changes in the database
                    db.commit()
                except Exception, e:
                    print(e)
                    print("db error")
                    db.rollback()
            except Exception, e:
                print ("error occured. looking for 1998 catalog.")
                url = 'https://oscar.gatech.edu/pls/bprod/bwckctlg.p_disp_course_detail?cat_term_in=199802&subj_code_in='+courseDept+'&crse_numb_in='+courseNum
                response = s.get(url)
                soup = bs4.BeautifulSoup(response.text, 'html.parser')
                codes = soup.select('.nttitle')
                courseTitle = str(codes[0]).split(" - ")[1].split("</td>")[0]
                print str(cnt) + " " + (courseTitle)
                sql = "update course SET title= %s where courseDept = %s and courseNum = %s"
                courseData = [courseTitle, courseDept, courseNum]
                courseDataTuple = tuple(courseData)
                try:
                    # Execute the SQL command
                    cursor.execute(sql, courseDataTuple)
                    # Commit your changes in the database
                    db.commit()
                except Exception, e:
                    print(e)
                    print("db error")
                    db.rollback()
            else:
                break
    db.close()
    f.close()

parseCourseName()
