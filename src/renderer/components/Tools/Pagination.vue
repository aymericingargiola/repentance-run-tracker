<template>
    <div v-if="pages > 1" class="pagination-container">
        <div class="pagination">
            <template v-for="page in pages">
                <div v-if="showPage(page)" :class="['page', currentPage === page ? 'active' : '']" v-on:click="changePage(page)" :key="`page-${page}`">{{page}}</div>
                <div v-if="showOffset(page)" class="page-offset" :key="`page-${page}`">...</div>
            </template>
        </div>
    </div>
</template>

<script>
export default {
    name: "Pagination",
    props: {
        total: Number,
        limitPerPage: Number,
        offset: Number,
        currentPage: Number
    },
    computed: {
        pages() {
            return Math.ceil(this.total / this.limitPerPage)
        }
    },
    methods: {
        changePage(page) {
            this.$emit('updatePagination', {offset: this.limitPerPage * (page - 1), currentPage: page})
        },
        showPage(page) {
            return page === 1 || page === this.pages || [this.currentPage-2, this.currentPage-1, this.currentPage, this.currentPage+1, this.currentPage+2].includes(page)
        },
        showOffset(page) {
            return (page > 1 || page <  this.pages) && (page === this.currentPage-3 && this.currentPage >= 5 || page === this.currentPage+3 && this.currentPage <= this.pages-4)
        }
    }
};
</script>

<style lang="scss">
@import "../../assets/styles/scss/vars/_colors";
.pagination-container {
    width: 100%;
    display: flex;
    justify-content: center;
    z-index: 0;
    .pagination {
        display: flex;
        align-items: center;
        .page, .page-offset {
            padding: 8px;
        }
        .page {
            opacity: 0.7;
            cursor: pointer;
            transition: 0.5s ease;
            &.active {
                opacity: 1;
                font-size: 170%;
            }
            &-offset {
                pointer-events: none;
                cursor: default;
            }
        }
    }
}
</style>