#include <algorithm>
#include <cstdint>
#include <iostream>
#include <numeric>
#include <vector>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n = 0;
    int k = 0;
    std::cin >> n >> k;

    std::vector<std::int64_t> values(n);
    for (int i = 0; i < n; ++i) {
        std::cin >> values[i];
    }

    const int cycles = std::gcd(n, k);
    std::vector<bool> visited(n, false);
    std::int64_t answer = 0;

    for (int start = 0; start < cycles; ++start) {
        if (visited[start]) {
            continue;
        }

        std::vector<std::int64_t> cycle_values;
        int idx = start;
        while (!visited[idx]) {
            visited[idx] = true;
            cycle_values.push_back(values[idx]);
            idx = (idx + k) % n;
        }

        std::sort(cycle_values.begin(), cycle_values.end());
        const std::int64_t median = cycle_values[cycle_values.size() / 2];
        for (const std::int64_t x : cycle_values) {
            answer += std::llabs(x - median);
        }
    }

    std::cout << answer << '\n';
    return 0;
}
