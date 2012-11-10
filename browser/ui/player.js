var EventEmitter = require("events").EventEmitter
var ArrowKeys = require("arrow-keys")

module.exports = Player

function Player(paper, relative) {
    var x = relative.x, y = relative.y
    var w = 86, h = 133
    
    var directions = [ 'front', 'back', 'left', 'right' ]
    var color = 'orange'
    var sprites = directions.reduce(function (acc, dir) {
        var pre = '/wizard_' + color + '_' + dir + '_'
        acc[dir] = [
            paper.image(pre + '0.svg', x, y, w, h).hide(),
            paper.image(pre + '1.svg', x, y, w, h).hide(),
        ]
        return acc
    }, {})

    var keys = ArrowKeys()
    var direction = 'front'
    var last = Date.now()
    
    keys.on('change', function (key, value) {
        var d = {
            'x+1' : 'right',
            'x-1' : 'left',
            'y-1' : 'back',
            'y+1' : 'front',
        }[key + (value < 0 ? '' : '+') + value]
        last = Date.now()
        if (direction !== d) animate()
        direction = d
    })
    
    var animate = (function () {
        var prev = null;
        var ix = 0
        return function () {
            if (Date.now() - last < 100) {
                if (prev) prev.hide()
                prev = sprites[direction][++ix % 2].show()
            }
        }
    })()
    animate()
    setInterval(animate, 100)

    return keys
}
