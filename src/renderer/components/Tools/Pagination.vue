<template>
  <div
    v-if="pages > 1"
    class="pagination-container"
  >
    <div class="pagination">
      <template v-for="page in pages">
        <div
          v-if="showPage(page)"
          :key="`page-${page}`"
          :class="['page', currentPage === page ? 'active' : '']"
          @click="changePage(page)"
        >
          {{ page }}
        </div>
        <div
          v-if="showOffset(page)"
          :key="`offset page-${page}`"
          class="page-offset"
        >
          ...
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
    name: "Pagination",
    props: {
        itemsTotal: Number,
        itemsPerPage: Number,
        maxPagesVisible: Number,
        offset: Number,
        currentPage: Number
    },
    computed: {
        pages() {
            return Math.ceil(this.itemsTotal / this.itemsPerPage)
        },
        getMaxPages() {
            return this.maxPagesVisible ? this.maxPagesVisible : 3
        },
        maxPagesRange() {
            const pagesRange = [this.currentPage]
            for (let pageNb = 1; pageNb < this.getMaxPages; pageNb++) {
                pagesRange.push(this.currentPage-pageNb, this.currentPage+pageNb)
            }
            return pagesRange
        }
    },
    methods: {
        changePage(page) {
            this.$emit('updatePagination', {offset: this.itemsPerPage * (page - 1), currentPage: page})
        },
        showPage(page) {
            return page === 1 || page === this.pages || this.maxPagesRange.includes(page)
        },
        showOffset(page) {
            return page > 1 && page < this.pages && (page === this.currentPage - this.getMaxPages && this.currentPage > this.getMaxPages || page === this.currentPage + this.getMaxPages && this.currentPage < this.pages - this.getMaxPages)
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