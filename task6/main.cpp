#include <algorithm>
#include <iostream>
#include <unordered_map>
#include <vector>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n = 0;
    std::cin >> n;

    std::vector<int> values(n);
    for (int i = 0; i < n; ++i) {
        std::cin >> values[i];
    }

    std::vector<int> sorted_values = values;
    std::sort(sorted_values.begin(), sorted_values.end());

    std::unordered_map<int, int> delta_count;
    delta_count.reserve(static_cast<std::size_t>(2 * n) + 1U);

    int non_zero_keys = 0;
    int partitions = 0;

    auto apply_delta = [&](const int key, const int change) -> void {
        const int old_value = delta_count[key];
        const int new_value = old_value + change;

        if (old_value == 0 && new_value != 0) {
            ++non_zero_keys;
        } else if (old_value != 0 && new_value == 0) {
            --non_zero_keys;
        }

        delta_count[key] = new_value;
    };

    for (int i = 0; i < n; ++i) {
        apply_delta(values[i], +1);
        apply_delta(sorted_values[i], -1);

        if (non_zero_keys == 0) {
            ++partitions;
        }
    }

    std::cout << partitions << '\n';
    return 0;
}
