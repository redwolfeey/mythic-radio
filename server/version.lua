AddEventHandler('Core:Shared:Ready', function()
    exports['mythic-base']:RequestDependencies(GetCurrentResourceName(), {
        'Version',
    }, function(error)
        if #error > 0 then return end
        local Version = exports['mythic-base']:FetchComponent('Version')
        Version:Check('Mythic-Framework/Mythic-VersionCheckers', GetCurrentResourceName())
    end)
end)
