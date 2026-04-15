#include <algorithm>
#include <iostream>
#include <numeric>
#include <vector>

namespace {

class GcdSegmentTree {
public:
    explicit GcdSegmentTree(const std::vector<int>& values)
        : n_(static_cast<int>(values.size())), tree_(4 * std::max(1, n_), 0) {
        if (n_ > 0) {
            build(1, 0, n_ - 1, values);
        }
    }

    void point_update(const int index, const int new_value) {
        if (n_ == 0) {
            return;
        }
        point_update_impl(1, 0, n_ - 1, index, new_value);
    }

    int all_gcd() const {
        return (n_ == 0) ? 0 : tree_[1];
    }

private:
    void build(
        const int node,
        const int left,
        const int right,
        const std::vector<int>& values) {
        if (left == right) {
            tree_[node] = values[left];
            return;
        }

        const int mid = (left + right) / 2;
        build(node * 2, left, mid, values);
        build(node * 2 + 1, mid + 1, right, values);
        tree_[node] = std::gcd(tree_[node * 2], tree_[node * 2 + 1]);
    }

    void point_update_impl(
        const int node,
        const int left,
        const int right,
        const int index,
        const int new_value) {
        if (left == right) {
            tree_[node] = new_value;
            return;
        }

        const int mid = (left + right) / 2;
        if (index <= mid) {
            point_update_impl(node * 2, left, mid, index, new_value);
        } else {
            point_update_impl(node * 2 + 1, mid + 1, right, index, new_value);
        }
        tree_[node] = std::gcd(tree_[node * 2], tree_[node * 2 + 1]);
    }

    int n_;
    std::vector<int> tree_;
};

}  // namespace

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n = 0;
    int m = 0;
    std::cin >> n >> m;

    std::vector<int> values(n);
    for (int i = 0; i < n; ++i) {
        std::cin >> values[i];
    }

    GcdSegmentTree segment_tree(values);

    for (int i = 0; i < m; ++i) {
        int index_1_based = 0;
        int divisor = 0;
        std::cin >> index_1_based >> divisor;
        const int index = index_1_based - 1;

        values[index] /= divisor;
        segment_tree.point_update(index, values[index]);

        std::cout << segment_tree.all_gcd() << '\n';
    }

    return 0;
}
