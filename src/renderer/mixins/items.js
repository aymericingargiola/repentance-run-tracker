export default {
    methods: {
        getWikiUrl(item) {
            const wikiUrls = {
                "default": "https://bindingofisaacrebirth.fandom.com/wiki/",
                "fiendfolio-reheated": "https://fiendfolio.wiki.gg/wiki/"
            }
            switch (item.category) {
                case "fiendfolio-reheated":
                    return `${wikiUrls["fiendfolio-reheated"]}${encodeURIComponent(item.title.replace(/ /g,'_'))}`
                default:
                    return `${wikiUrls["default"]}${encodeURIComponent(item.title.replace(/ /g,'_'))}`
            }
        }
    }
}