#include <algorithm>
#include <iostream>
#include <string>
#include <unordered_map>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n = 0;
    std::cin >> n;

    std::unordered_map<std::string, int> counts;
    counts.reserve(static_cast<std::size_t>(2 * n) + 1U);

    int best = 0;
    for (int i = 0; i < n; ++i) {
        std::string word;
        std::cin >> word;
        std::sort(word.begin(), word.end());

        const int new_count = ++counts[word];
        if (new_count > best) {
            best = new_count;
        }
    }

    std::cout << best << '\n';
    return 0;
}
