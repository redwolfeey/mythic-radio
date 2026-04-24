fx_version 'cerulean'
game 'gta5'
lua54 'yes'

version '1.0.1'
repository 'https://github.com/Mythic-Framework/mythic-radio'

client_script "@mythic-base/components/cl_error.lua"
client_script "@mythic-pwnzor/client/check.lua"
client_scripts {
    'config.lua',
    'client/*.lua',
}

ui_page "ui/html/index.html"

files {
    "ui/html/main.js",
    "ui/html/index.html",
    "ui/html/*.png",
}
server_script 'server/version.lua'