#include <algorithm>
#include <cstdint>
#include <iostream>
#include <limits>
#include <vector>

namespace {

class SegmentTreeMax {
public:
    explicit SegmentTreeMax(const std::vector<std::int64_t>& values)
        : n_(static_cast<int>(values.size())), tree_(4 * std::max(1, n_), 0) {
        if (n_ > 0) {
            build(1, 0, n_ - 1, values);
        }
    }

    int find_last_greater(
        const int query_left,
        const int query_right,
        const std::int64_t threshold) const {
        if (n_ == 0 || query_left > query_right) {
            return -1;
        }
        return find_last_greater_impl(
            1, 0, n_ - 1, query_left, query_right, threshold);
    }

    int find_first_greater(
        const int query_left,
        const int query_right,
        const std::int64_t threshold) const {
        if (n_ == 0 || query_left > query_right) {
            return -1;
        }
        return find_first_greater_impl(
            1, 0, n_ - 1, query_left, query_right, threshold);
    }

private:
    void build(
        const int node,
        const int left,
        const int right,
        const std::vector<std::int64_t>& values) {
        if (left == right) {
            tree_[node] = values[left];
            return;
        }

        const int mid = (left + right) / 2;
        build(node * 2, left, mid, values);
        build(node * 2 + 1, mid + 1, right, values);
        tree_[node] = std::max(tree_[node * 2], tree_[node * 2 + 1]);
    }

    int find_last_greater_impl(
        const int node,
        const int seg_left,
        const int seg_right,
        const int query_left,
        const int query_right,
        const std::int64_t threshold) const {
        if (seg_right < query_left || seg_left > query_right) {
            return -1;
        }
        if (tree_[node] <= threshold) {
            return -1;
        }
        if (seg_left == seg_right) {
            return seg_left;
        }

        const int mid = (seg_left + seg_right) / 2;

        const int right_answer = find_last_greater_impl(
            node * 2 + 1, mid + 1, seg_right, query_left, query_right, threshold);
        if (right_answer != -1) {
            return right_answer;
        }

        return find_last_greater_impl(
            node * 2, seg_left, mid, query_left, query_right, threshold);
    }

    int find_first_greater_impl(
        const int node,
        const int seg_left,
        const int seg_right,
        const int query_left,
        const int query_right,
        const std::int64_t threshold) const {
        if (seg_right < query_left || seg_left > query_right) {
            return -1;
        }
        if (tree_[node] <= threshold) {
            return -1;
        }
        if (seg_left == seg_right) {
            return seg_left;
        }

        const int mid = (seg_left + seg_right) / 2;

        const int left_answer = find_first_greater_impl(
            node * 2, seg_left, mid, query_left, query_right, threshold);
        if (left_answer != -1) {
            return left_answer;
        }

        return find_first_greater_impl(
            node * 2 + 1, mid + 1, seg_right, query_left, query_right, threshold);
    }

    int n_;
    std::vector<std::int64_t> tree_;
};

}  // namespace

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n = 0;
    int m = 0;
    std::cin >> n >> m;

    std::vector<std::pair<std::int64_t, std::int64_t>> platforms(n);
    for (int i = 0; i < n; ++i) {
        std::int64_t left = 0;
        std::int64_t right = 0;
        std::cin >> left >> right;
        platforms[i] = {left, right};
    }

    std::vector<std::int64_t> balls(m);
    for (int i = 0; i < m; ++i) {
        std::cin >> balls[i];
    }
    std::sort(balls.begin(), balls.end());

    std::vector<std::int64_t> gaps;
    if (m >= 2) {
        gaps.resize(m - 1);
        for (int i = 0; i + 1 < m; ++i) {
            gaps[i] = balls[i + 1] - balls[i];
        }
    }
    const SegmentTreeMax gap_tree(gaps);

    std::int64_t total_cost = 0;

    for (const auto& platform : platforms) {
        const std::int64_t left = platform.first;
        const std::int64_t right = platform.second;
        const std::int64_t length = right - left;

        const int first_inside = static_cast<int>(
            std::upper_bound(balls.begin(), balls.end(), left) - balls.begin());
        const int after_last_inside = static_cast<int>(
            std::lower_bound(balls.begin(), balls.end(), right) - balls.begin());
        const int last_inside = after_last_inside - 1;

        if (first_inside > last_inside) {
            continue;
        }

        int component_left_index = first_inside;
        const std::int64_t connect_threshold = length - 1;

        if (first_inside > 0) {
            const int last_blocking_gap = gap_tree.find_last_greater(
                0, first_inside - 1, connect_threshold);
            component_left_index = (last_blocking_gap == -1) ? 0 : (last_blocking_gap + 1);
        }

        int component_right_index = last_inside;
        if (last_inside <= m - 2) {
            const int first_blocking_gap = gap_tree.find_first_greater(
                last_inside, m - 2, connect_threshold);
            component_right_index =
                (first_blocking_gap == -1) ? (m - 1) : first_blocking_gap;
        }

        const std::int64_t left_exit_cost = right - balls[component_left_index];
        const std::int64_t right_exit_cost = balls[component_right_index] - left;
        total_cost += std::min(left_exit_cost, right_exit_cost);
    }

    std::cout << total_cost << '\n';
    return 0;
}
