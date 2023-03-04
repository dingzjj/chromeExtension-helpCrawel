//dataStarting一个是一个字符串：相对应的节点
//Shift + Alt + F快捷键格式化代码

//element和selector是一对多的关系，存储格式为
//{element:{element:[selector],element:[selector]}}
var StartingURLsString = "";
var StartingURLsArray = [];
let nowURL = "";
let baseURL = "";
let elements = {};
let last = "";
let normalElement = ["Index","New", "Report", 
"Expert","Title", "Authors", "Content",
    "Description", "Link","PublicationTime","Name"];
let elementToFunction = [IndexText, NewText, ReportText, 
    ExpertText,TitleText, AuthorsText, ContentText,
    DescriptionText, LinkText, PublicationTimeText, 
    NameText];


function recoveryData() {
    //baseURL的恢复，在baseURLInStorage中
    chrome.storage.sync.get("baseURLInStorage", function (result) {
        if (typeof result.baseURLInStorage === "string") {
            $("#baseURLTEXT").attr("value", result.baseURLInStorage);
        } else {
            $("#baseURLTEXT").attr("value", baseURL);
        }
        baseURL = result.baseURLInStorage;
    });

    //StartingURLs的恢复,在dataStartingURLsInStorage中
    chrome.storage.sync.get("dataStartingURLsInStorage", function (result) {
        //对 dataStartingURLs的恢复
        //result.dataStartingURLsInStorage是个Map才进行恢复
        //遍历将dataStartingURLs重新添加到下拉框中
        //在dataStartingURLsInStorage以字符串的形式保存
        StartingURLsString = result.dataStartingURLsInStorage;
        // alert(result.dataStartingURLsInStorage);
        StartingURLsArray = StartingURLsString.split(",");
        deleteSpace(StartingURLsArray);
        for (let value of StartingURLsArray) {
            let newOption = document.createElement("option");
            if (newOption) {
                newOption.append(value);
                //append对Element内部操作
                $("#StartingURLsSelect").append(newOption);
            }
        }



    })


    chrome.storage.sync.get("elements", function (result) {
        /*
           element和selector的恢复
       */

        elements = result.elements
        for (let value of Object.keys(elements)) {
            let newOption = document.createElement("option");
            if (newOption) {
                newOption.append(value);
                //append对Element内部操作
                $("#elementsSelect").append(newOption);
            }
        }
        let nowElement = getSelectedFromElements();
        if (nowElement) {
            let selectorsArray = elements[nowElement];
            $("#selectorsSelect").html("");
            for (let value of selectorsArray) {
                let newOption = document.createElement("option");
                if (newOption) {
                    newOption.append(value);
                    //append对Element内部操作
                    $("#selectorsSelect").append(newOption);
                }
            }
        }
        let firstValue;
        for (let value of Object.keys(elements)) {
            firstValue = value;
            break;
        }
        if (firstValue) {
            if (elements[firstValue].length !== 0) {
                $("#text").text(createText(firstValue, elements[firstValue][0]));
            }

        }



    });





}

/*
    由此进入
*/
window.onload = function () {
    test();
    /*
        
        一开始数据的初始化，根据storage中的isInitialize来
    
    */
    chrome.storage.sync.get("isInitialize", function (result) {

        if (result.isInitialize) {
            //重新打开后的数据恢复
            recoveryData();
            return;
        }
        alert("start");
        elements ={};
        StartingURLsString = "";
        nowURL = "";
        baseURL = "";
        storageData = {};
        chrome.storage.sync.set({ "baseURLInStorage": "", }, function () { })
        chrome.storage.sync.set({ "isInitialize": 1, }, function () { })
        for (let value of normalElement) {
            elements[value] = [];
        }
        for (let value of Object.keys(elements)) {
            let newOption = document.createElement("option");
            if (newOption) {
                newOption.append(value);
                //append对Element内部操作
                $("#elementsSelect").append(newOption);
            }
        }
        chrome.storage.sync.set({ "elements": elements }, function () { });
        chrome.storage.sync.set({ "addCode": {} }, function () { });
        //初始化完成




    });



    /*
        StartingURLsInsert的快速插入
    */
    $("#StartingURLsInsert").click(function () {
        //    捕获到当前的URL，捕获到StartingURL信息
        chrome.tabs.getSelected(null, function (tab) {
            nowURL = tab.url;
        })
        if (nowURL == "") {
            return;
        }
        //c当前url
        //将url记录在dataStartingURLs中，并修改下拉框
        // 创建一个option结点
        //保存Insert的StartingURLs
        //先判断是否dataStartingURLs中是否有
        // dataStartingURLs先变成数组
        // 处理掉空白属性

        deleteSpace(StartingURLsArray);
        if (StartingURLsArray.findIndex(function (value) {
            return value == String(nowURL);
        }) == -1) {
            let newOption = document.createElement("option");
            StartingURLsArray.push(nowURL);
            if (newOption) {
                newOption.append(nowURL);
                //append对Element内部操作
                $("#StartingURLsSelect").append(newOption);
                //在从array变成string
                let stringOfStartingURLs = StartingURLsArray.join(",");


                //删除最后一个多余的,
                // storage中保存值
                chrome.storage.sync.set({ "dataStartingURLsInStorage": stringOfStartingURLs }, function () { });
            } else {
                alert("error insert");
            }

        }

    })
    /*
        StartingURLsDelete的快速删除
    */
    $("#StartingURLsDelete").click(function () {
        //得到当前下拉框中的元素
        let deleteURL = getSelectedFromStartingURLs();
        //从storage中删除该元素，且删除该下拉框
        let deleteIndex = StartingURLsArray.findIndex(function (value) {
            return value == deleteURL;
        })
        StartingURLsArray.splice(deleteIndex, 1);
        StartingURLsString = StartingURLsArray.join(",");
        chrome.storage.sync.set({ "dataStartingURLsInStorage": StartingURLsString }, function () { });

        //删除下拉框,即修改selected元素
        $("#StartingURLsSelect").html("");
        for (let value of StartingURLsArray) {
            let newOption = document.createElement("option");
            if (newOption) {
                newOption.append(value);
                //append对Element内部操作
                $("#StartingURLsSelect").append(newOption);
            }
        }


    });


    /*
       baseURL的快速插入
    */
    $("#baseURLInsert").click(function () {
        let oldBaseURL = "";
        //    捕获到当前的URL，捕获到StartingURL信息
        chrome.tabs.getSelected(null, function (tab) {
            baseURL = tab.url;
        })
        //如果当前网站和之前的不同才进行修改
        chrome.storage.sync.get("baseURLInStorage", function (result) {
            oldBaseURL = result.baseURLInStorage;
        });
        if (baseURL !== oldBaseURL) {
            $("#baseURLTEXT").attr("value", baseURL);
            // storage中保存值
            chrome.storage.sync.set({ "baseURLInStorage": baseURL }, function () { });
        }

    })
    /*
        elementsTEXT的快速插入
    */
    $("#elementsInsert").click(function () {
        let insertElement = "";
        //    获取elementsTEXT的value
        insertElement = $("#elementsTEXT").val();
        if (insertElement === "") {
            return;
        }
        //如果elements中没有才进行修改
        if (!(insertElement in elements)) {
            elements[insertElement] = []
            //并修改下拉框和清空text中的值
            $("#elementsTEXT").val("");
            $("#elementsSelect").html("");
            for (let value of Object.keys(elements)) {
                let newOption = document.createElement("option");
                if (newOption) {
                    newOption.append(value);
                    //append对Element内部操作
                    $("#elementsSelect").append(newOption);
                }
            }
            chrome.storage.sync.set({ "element": elements }, function () { });
        }
        changeText()

    })
    /*
       elements的快速删除
   */

    $("#elementsDelete").click(function () {
        // 根据下拉框中的值来删除
        //得到当前下拉框中的元素
        let deleteElement = getSelectedFromElements();
        //删除其中元素
        delete elements[deleteElement];
        chrome.storage.sync.set({ "element": elements }, function () { });

        //删除下拉框,即修改selected元素
        $("#elementsSelect").html("");
        for (let value of Object.keys(elements)) {
            let newOption = document.createElement("option");
            if (newOption) {
                newOption.append(value);
                //append对Element内部操作
                $("#elementsSelect").append(newOption);
            }
        }
        changeText()

    });


    /*
    selector的快速插入
    */
    $("#selectorsInsert").click(function () {
        let insertSelectot = "";
        //    获取elementsTEXT的value
        insertSelectot = $("#selectorsTEXT").val();
        if (insertSelectot === "") {
            return;
        }
        let nowElement = getSelectedFromElements();

        let arrayOfSelector = elements[nowElement];
        //如果elements中没有才进行修改
        //有nowElement当该element一种没有该值才要添加,一种有该值
        if (!isFindInArray(arrayOfSelector, insertSelectot)) {
            arrayOfSelector.push(insertSelectot);
            //并修改下拉框和清空text中的值
            $("#selectorsTEXT").val("");
            $("#selectorsSelect").html("");
            for (let value of arrayOfSelector) {
                let newOption = document.createElement("option");
                if (newOption) {
                    newOption.append(value);
                    //append对Element内部操作
                    $("#selectorsSelect").append(newOption);
                }
            }
            elements[nowElement]=arrayOfSelector;
            chrome.storage.sync.set({ "elements": elements }, function () { });


        }
        changeText()
    })

    /*
    selector的快速删除
    */

    $("#selectorsDelete").click(function () {
        //当前元素
        let nowElement = getSelectedFromElements();
        let deleteSelector = getSelectedFromSelectors()
        //从storage中删除该Selector，且删除该下拉框
        //element的selector数组为：
        let selectorsArray = elements[nowElement];
        //删除selectorsArray中
        findInArrayReturnIndex(selectorsArray, deleteSelector);

        selectorsArray.splice(findInArrayReturnIndex, 1);

        chrome.storage.sync.set({ "element": elements }, function () { });

        //删除下拉框,即修改selected元素
        //并修改下拉框和清空text中的值
        $("#selectorsTEXT").val("");
        $("#selectorsSelect").html("");
        for (let value of selectorsArray) {
            let newOption = document.createElement("option");
            if (newOption) {
                newOption.append(value);
                //append对Element内部操作
                $("#selectorsSelect").append(newOption);
            }
        }
        changeText()
    });


    /*
        element下拉框的改变能引起selector的改变
    */
    $("#elementsSelect").change(function () {
        let nowElement = getSelectedFromElements();
        let selectorsArray = elements[nowElement];
        $("#selectorsSelect").html("");
        for (let value of selectorsArray) {
            let newOption = document.createElement("option");
            if (newOption) {
                newOption.append(value);
                //append对Element内部操作
                $("#selectorsSelect").append(newOption);
            }
        }

        changeText();

    })
    $("#selectorsSelect").change(function () {
        changeText();
    })

    /*
        storage中数据的清除
    */
    $("#finish").click(function () {
        //数据的清除和代码的生成
        // let string_;
        chrome.storage.sync.set({ "baseURLInStorageTitle": extractTitle() }, function () { });
        // chrome.storage.sync.get("dataStartingURLsInStorage", function (result) {
        //     stringOfStartingURLs = result.dataStartingURLsInStorage;
        //     string_=result.dataStartingURLsInStorage;
        // });

        if (finiallyCreateText(new String(StartingURLsString)) == "error") { return; };

        // dataStartingURLsInStorage得清空
        chrome.storage.sync.set({ "dataStartingURLsInStorage": "" }, function () { });
        chrome.storage.sync.set({ "isInitialize": 0 }, function () { });
        chrome.storage.sync.set({ "elements": {} }, function () { });
        chrome.storage.sync.set({ "addCode": {} }, function () { });
    })

    /*
        element下拉框的变化和selectot的变化都会引起text的变化
        text只是一种展示，只有但你按下add键后才会记录你要修改的部分

    */

    /*
    addCode的添加
    存储格式：  addCode:{element:{selector:....}}
    */
    $("#addCode").click(function () {

        let nowElement = getSelectedFromElements();
        let nowSelector = getSelectedFromSelectors();

        let addCode = {};
        chrome.storage.sync.get("addCode", function (result) {
            addCode = result.addCode;
        });
        if (nowElement in addCode) {
            addCode[nowElement][nowSelector] = $("#text").text()
        } else {
            addCode[nowElement] = { nowSelector: $("#text").text() }
        }

        chrome.storage.sync.set({ "addCode": addCode }, function () { });

    })


    $("#lastFinish").click(function () {
        chrome.storage.sync.get("last", function (result) {
            last = result.last
            if (last) {
                $("#text").text(last);
            } else {
                alert("没有上一个的信息");
            }
        });
    })


}






/*
    以下为API
*/


function ifHaveInAddCode(nowElement, nowSelector) {
    let addCode = {};
    chrome.storage.sync.get("addCode", function (result) {
        addCode = result.addCode;
    });
    if (nowElement in addCode) {
        if (nowSelector in addCode[nowElement]) {
            return true;
        }
    }
    return false;
}

function getCodeFromAddCode(nowElement, nowSelector) {
    //判断addCode中是否有：
    let addCode = {};
    chrome.storage.sync.get("addCode", function (result) {
        addCode = result.addCode;
    });
    $("#text").text(addCode[nowElement][nowSelector]);
}
/*
    判断+改变text中的内容
*/
function changeText() {
    //首先要selector和element中值不为空才行
    let nowElement = getSelectedFromElements();
    let nowSelector = getSelectedFromSelectors();
    if (nowElement.trim() !== "" && nowSelector.trim() !== "") {
        if (ifHaveInAddCode(nowElement, nowSelector)) { getCodeFromAddCode(nowElement, nowSelector); return }
        $("#text").text(createText(nowElement, nowSelector));
    } else {
        $("#text").text("");

    }


}

function finiallyCreateText(stringOfStartingURLs) {
    //操作文件生成：
    //建议：读取file中的信息然后替换
    chrome.runtime.getPackageDirectoryEntry(function (root) {
        root.getFile('file/template.txt', {}, function (fileEntry) {
            fileEntry.file(function (file) {
                var reader = new FileReader();
                reader.onloadend = function (e) {

                    let text = this.result;

                    text = replaceInText(text, stringOfStartingURLs)
                        //发现异常
                    chrome.storage.sync.set({ "last": text }, function () { });
                    //存储在last中,并将其存储在text中
                    $("#text").text(text);
                };
                reader.readAsText(file);
            });
        });
    });

    return "finish";
}
/*
读取file中的信息然后替换
*/
function replaceInText(text, stringOfStartingURLs) {
    // #baseURLInStorageTitle#的替换
    if (extractTitle()) {
        text = text.replace(/#baseURLInStorageTitle#/g, extractTitle());
    } else {
        alert("error:baseURL");
        text = text.replace(/#baseURLInStorageTitle#/g, "");
    }
    // #baseURLInStorage#的替换
    if (baseURL) {
        text = text.replace(/#baseURLInStorage#/g, baseURL);
    }
    //#dataStartingURLsInStorage#的替换【error】
    //stringOfStartingURLs需要结果处理
    text = text.replace(/#dataStartingURLsInStorage#/g, dealstringOfStartingURLs(stringOfStartingURLs));



    //#element#的替换,将element的属性逐一来，如果add中有就用add的
    text = text.replace(/ #element#/g, elementText());

    return text;



}
function dealstringOfStartingURLs(stringOfStartingURLs){
    stringOfStartingURLs =stringOfStartingURLs.replaceAll(",","\",\"")+"\",";
    stringOfStartingURLs="\""+stringOfStartingURLs;

    return stringOfStartingURLs;
}
//{element:{element:[selector],element:[selector]}}
// 存储格式：  addCode:{element:{selector:....}}

function elementText() {
    let text = "";
    for (let key of Object.keys(elements)) {
        let selectorArray = elements[key];
        for (let valueOfArray of selectorArray) {
            if (key in addCode && valueOfArray in addCode[key]) {
                text += addCode[valueOfArray];
            } else {
                text += createText(key, valueOfArray);
            }
        }

    }
    return text;


}
function extractTitle() {
    let pattern = /\.[a-zA-Z]+\./;
    let afterMatchArray = baseURL.match(pattern);
    if (afterMatchArray) {
        let afterMatchString = afterMatchArray[0];
        return afterMatchString.substring(1, afterMatchString.length - 1);


    } else {
        return null;
    }


}
function mapSize() {
    let size = 0;
    for (let key of dataStartingURLs.keys()) {
        size++;
    }
    return size;
}


function test() {
    // window.requestFileSystem(window.PESISTENT, 5 * 1024, ininFs);

    // function ininFs(fs) {
    //     fs.root.getFile("file/new.txt", { create: true, exclusive: true }, function (fileEntry) {
    //         fileEntry.isFile = true;
    //         fileEntry.name = "new.txt";
    //         fileEntry.fullPath = 'file/new.txt';
    //         fileEntry.createWriter(function (fileWriter) {
    //             fileWriter.seek(fileWriter.length);
    //             var bb = new BlobBuilder();
    //             bb.append("hi");
    //             fileWriter.write(bb.getBlob('text/plain'));
    //         })

    // chrome.storage.sync.set({ "one": 1 }, function () { });
    // chrome.storage.sync.set({ "one": 2 }, function () { });
    // chrome.storage.sync.get("one", function (result) {
    //     alert(result.one)
    //  });
    //storage中存对象测试
    // chrome.storage.sync.set({ "one": [1,2,3] }, function () { });
    // chrome.storage.sync.get("one", function (result) {
    //     alert(result.one)
    // });
    // let a = {};
    // a["hi"]=12;
    // alert(a["hi"]);
}

function deleteSpace(aArray) {
    let index = aArray.findIndex(function (value) {
        return value == "";
    });
    if (index != -1) {

        aArray.splice(index);
    }


}

function getSelectedFromStartingURLs() {
    // let e = document.getElementById("StartingURLsDelete")
    // if (e) {
    //     alert(e.options[e.options.selectedIndex]);
    // } else {
    //     return "no select";
    // }

    return $("#StartingURLsSelect option:checked").text();



}
function getSelectedFromElements() {
    let firstValue;
    for (let value of Object.keys(elements)) {
        firstValue = value;
        break;
    }
    if ($("#elementsSelect option:checked").text().trim() == "") {
        return firstValue;
    } else {
        return $("#elementsSelect option:checked").text()
    }

}
function getSelectedFromSelectors() {
    return $("#selectorsSelect option:checked").text();
}


function findInArrayReturnIndex(aArray, find) {
    return aArray.findIndex(function (value) {
        return value == find;
    })

}
function isFindInArray(aArray, find) {
    if (aArray.findIndex(function (value) {
        return value == find;
    }) == -1) {
        return false;
    }
    return true;

}

/*
    生成几种常见的text
*/
function createText(element, selector) {
    let index = findInArrayReturnIndex(normalElement, element);
    let text = "";
    if (index !== -1) {
        text = elementToFunction[index](selector);
    } else {
        text = normalText(element, selector);
    }
    return text;

}
function TitleText(selector) {
    // report.title
    return "w.OnHTML(\"" + selector + "\", func(element *colly.HTMLElement, ctx *crawlers.Context) {\n"
        + "   ctx.Title += element.Text"
        + "\n})\n";
}
function AuthorsText(selector) {
    // report.author
    return "w.OnHTML(\"" + selector + "\", func(element *colly.HTMLElement, ctx *crawlers.Context) {\n" +
        "	ctx.Authors = append(ctx.Authors, element.Text)" +
        " \n})\n"
}


function ContentText(selector) {
    // report .content
    return "w.OnHTML(\"" + selector + "\", func(element *colly.HTMLElement, ctx *crawlers.Context) {\n" +
        "	ctx.Content += element.Text"
        + "\n})\n";

}

function DescriptionText(selector) {
    // report .content
    return "w.OnHTML(\"" + selector + "\", func(element *colly.HTMLElement, ctx *crawlers.Context) {\n" +
        "	ctx.Description += element.Text"
        + "\n})\n";

}
function PublicationTimeText(selector) {
    // report .content
    return "w.OnHTML(\"" + selector + "\", func(element *colly.HTMLElement, ctx *crawlers.Context) {\n" +
        "	ctx.PublicationTime += element.Text"
        + "\n})\n";

}
function LinkText(selector) {
    // report .content
    return "w.OnHTML(\"" + selector + "\", func(element *colly.HTMLElement, ctx *crawlers.Context) {\n" +
        "	ctx.Link = append(ctx.Authors, element.Text)" +
        " \n})\n"
}
// "New", "Report", "Export","Index"
function NewText(selector) {
    return "w.OnHTML(\"" + selector + "\", func(element *colly.HTMLElement, ctx *crawlers.Context) {\n" +
        "w.Visit(element.Attr(\"href\"), crawlers.News)" +
        "\n})\n"
}
function ReportText(selector) {
    return "w.OnHTML(\"" + selector + "\", func(element *colly.HTMLElement, ctx *crawlers.Context) {\n" +
        "w.Visit(element.Attr(\"href\"), crawlers.Report)" +
        "\n})\n"
}
function ExpertText(selector) {
    return "w.OnHTML(\"" + selector + "\", func(element *colly.HTMLElement, ctx *crawlers.Context) {\n" +
        "w.Visit(element.Attr(\"href\"), crawlers.Expert)" +
        "\n})\n"
}
function NameText(selector) {
    return "w.OnHTML(\"" + selector + "\", func(element *colly.HTMLElement, ctx *crawlers.Context) {\n" +
        "	ctx.Name += element.Text"
        + "\n})\n";
}
function IndexText(selector) {
    return "w.OnHTML(\"" + selector + "\", func(element *colly.HTMLElement, ctx *crawlers.Context) {\n" +
        "w.Visit(element.Attr(\"href\"), crawlers.Index)" +
        "\n})\n"
}

function normalText(element, selector) {
    // report .content
    return "w.OnHTML(\"" + selector + "\", func(element *colly.HTMLElement, ctx *crawlers.Context) {\nctx." +
        element + " += element.Text"
        + "\n})\n";

}