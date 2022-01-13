export default {
    methods: {
        t(str, fallbackStr) {
            return this.$t && this.$te
            ? this.$te(str)
            ? this.$t(str)
            : fallbackStr
            : fallbackStr
            ? fallbackStr
            : str
        },
        formatLocaleId(id) {
            return id.replaceAll('.','-')
        }
    }
}