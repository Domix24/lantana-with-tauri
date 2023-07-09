export default (timerid: string) => ({
    timerid: parseInt(timerid.match(/^\d+/)![0]),
    resetOnly: new RegExp(/^\d+$/).test(timerid),
    resetOrigin: new RegExp(/^\d+[*]$/).test(timerid),
    resetNormal: new RegExp(/^\d+[!]$/).test(timerid),
    resetProgressive: new RegExp(/^\d+[+]$/).test(timerid),
})