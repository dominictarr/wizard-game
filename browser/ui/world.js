/*global screen:true, name:true*/
var screen = require("screen")
var Raphael = require("raphael-browserify")
var point = require("screen/point")
var generator = require("point-generator")
var pick = require("deck").pick
var uuid = require("node-uuid")

var entities = require("../entities")
var PlayerRepl = require("./playerRepl")

// mother of all hacks
var NAME = require("../name")
var renderPlayer = require("./renderPlayer")

var types = ["tree", "rock", "monster"]

module.exports = World

function World(model) {
    var width = window.innerWidth - 400 - 4
    var height = window.innerHeight - 80 - 4

    var paper = Raphael(0, 40, width, height)
    var center = point({ x: width / 2, y: height / 2 })
    var world = screen(center, width, height)

    console.log('WORLD')

    model.on("create", renderEntity)
    for (var id in model.rows)
      renderEntity(model.rows[id])

    world.center = center
    return world

    function renderEntity(row) {
        
        var state = row.state
        console.log('READY', state)

        if(state.type) ready()
        else           row.once("change", ready)

        function ready () {
            if (row.state.name === NAME.name) {
                var repl = PlayerRepl(row)

                return renderPlayer(paper, center, row)
            }

            if (row.state.dead) {
                return
            }

            if (!entities[state.type]) {
                return
            }

            create(row.state, state.type, row)
        }
    }

    function create(pos, type, row) {
        var absolute = point(pos)
        var relative = world.add(absolute)
        var alive = true

        var entity = entities[type](paper, relative, row)

        if (entity.node && entity.node.addEventListener) {
            entity.node.addEventListener('click', onclick)
        }
        else entity.on('click', onclick)
 
        function onclick (e) {
            world.emit('examine', row)
        }

        row.on("change", function (changes) {
            absolute(changes)

            if (changes.dead) {
                alive = false
                entity.cleanup()
            } else if (
                changes.dead === false &&
                alive === false
            ) {
                create(pos, type, row)
            }
        })
    }
}
