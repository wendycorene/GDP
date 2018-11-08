let Excel = require('exceljs')
let config = require('../../../config/excel')
let _ = require('underscore')
let StudentModel = require('../../../models/TheatreAppreciationStudent.model')
let AudienceModel = require('../../../models/Audience.model')

let GenerateReport = async (req, res, next) => {

    let workbook = new Excel.Workbook()
    let promises = []
    _.each(config.categories, function (category) {
        let model = category === 'students' ? StudentModel : AudienceModel
        workbook.addWorksheet(category)
        let worksheet = workbook.getWorksheet(category)
        worksheet.columns = config.columns[category]
        promises.push(
            new Promise((resolve, reject) => {
                model.find({ ShowID: req.body.show_id }, function (err, data) {
                    if (err || !data) return reject()
                    worksheet.addRows(data)
                    return resolve()
                })
            })
        )
    })

    await Promise.all(promises).catch((err) => {
        res.send(400, 'show not found')
    })
    workbook.xlsx.writeFile('./public/Reports/' + req.body.show_name).then(function () {
        res.send('response ready')
    })
}

module.exports.GenerateReport = GenerateReport