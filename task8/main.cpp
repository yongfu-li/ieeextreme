#include <iostream>
#include <utility>
#include <vector>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n = 0;
    int m = 0;
    int k = 0;
    std::cin >> n >> m >> k;

    std::vector<std::pair<int, int>> swaps(m + 1);
    for (int i = 1; i <= m; ++i) {
        int a = 0;
        int b = 0;
        std::cin >> a >> b;
        swaps[i] = {a, b};
    }

    // prefix_position[i] = position of element 1 after first i swaps.
    std::vector<int> prefix_position(m + 1, 1);
    for (int i = 1; i <= m; ++i) {
        int pos = prefix_position[i - 1];
        const int a = swaps[i].first;
        const int b = swaps[i].second;

        if (pos == a) {
            pos = b;
        } else if (pos == b) {
            pos = a;
        }
        prefix_position[i] = pos;
    }

    // suffix_map[x] = final position after applying current suffix to start x.
    std::vector<int> suffix_map(n + 1, 0);
    for (int x = 1; x <= n; ++x) {
        suffix_map[x] = x;
    }

    int answer = -1;

    for (int i = m; i >= 1; --i) {
        // Remove swap i: apply swaps 1..i-1, then i+1..m.
        const int start_after_prefix = prefix_position[i - 1];
        const int final_position = suffix_map[start_after_prefix];
        if (final_position == k) {
            answer = i;
        }

        // Extend suffix by adding swap i in front:
        // new_map(x) = old_map(apply_swap_i(x)).
        const int a = swaps[i].first;
        const int b = swaps[i].second;
        std::swap(suffix_map[a], suffix_map[b]);
    }

    std::cout << answer << '\n';
    return 0;
}
