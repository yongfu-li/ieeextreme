#include <cstdint>
#include <iostream>
#include <limits>
#include <unordered_map>
#include <vector>

namespace {

std::int64_t grouped_cost(const int count, const int size_value) {
    if (count <= 0) {
        return 0;
    }
    const std::int64_t c = count;
    const std::int64_t s = size_value;
    return ((c + s - 1) / s) * s;
}

int minimal_new_color_size_not_equal_to(const int forbidden_size) {
    return (forbidden_size == 1) ? 2 : 1;
}

}  // namespace

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int t = 0;
    std::cin >> t;

    while (t-- > 0) {
        int n = 0;
        std::cin >> n;

        std::unordered_map<int, int> frequency;
        frequency.reserve(static_cast<std::size_t>(2 * n) + 1U);
        for (int i = 0; i < n; ++i) {
            int value = 0;
            std::cin >> value;
            ++frequency[value];
        }

        std::vector<int> distinct_values;
        distinct_values.reserve(frequency.size());

        std::int64_t base_truthful_cost = 0;
        int count_sizes_with_spare = 0;
        std::unordered_map<int, bool> has_spare_with_full_count;
        has_spare_with_full_count.reserve(static_cast<std::size_t>(2 * frequency.size()) + 1U);

        for (const auto& entry : frequency) {
            const int size_value = entry.first;
            const int count = entry.second;
            distinct_values.push_back(size_value);

            const std::int64_t full_cost = grouped_cost(count, size_value);
            base_truthful_cost += full_cost;

            const bool has_spare = (full_cost - count) > 0;
            has_spare_with_full_count[size_value] = has_spare;
            if (has_spare) {
                ++count_sizes_with_spare;
            }
        }

        std::int64_t answer = std::numeric_limits<std::int64_t>::max();

        for (const int lie_report_value : distinct_values) {
            const int full_count = frequency[lie_report_value];

            const std::int64_t truthful_cost =
                base_truthful_cost
                - grouped_cost(full_count, lie_report_value)
                + grouped_cost(full_count - 1, lie_report_value);

            const bool this_value_has_spare_full =
                has_spare_with_full_count[lie_report_value];
            const bool has_spare_other_than_lie_value =
                count_sizes_with_spare - (this_value_has_spare_full ? 1 : 0) > 0;

            std::int64_t extra_cost_for_liar = 0;
            if (!has_spare_other_than_lie_value) {
                extra_cost_for_liar =
                    minimal_new_color_size_not_equal_to(lie_report_value);
            }

            const std::int64_t candidate = truthful_cost + extra_cost_for_liar;
            if (candidate < answer) {
                answer = candidate;
            }
        }

        std::cout << answer << '\n';
    }

    return 0;
}
