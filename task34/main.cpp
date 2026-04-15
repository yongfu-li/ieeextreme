#include <algorithm>
#include <array>
#include <cctype>
#include <iostream>
#include <string>
#include <vector>

using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string permutation;
    cin >> permutation;

    int n = 0;
    cin >> n;

    array<int, 26> base_rank{};
    for (int i = 0; i < 26; ++i) {
        base_rank[permutation[i] - 'a'] = i;
    }

    vector<string> words(n);
    for (int i = 0; i < n; ++i) {
        cin >> words[i];
    }

    auto char_rank = [&](const char ch) -> int {
        const bool is_upper = (ch >= 'A' && ch <= 'Z');
        const char lower = static_cast<char>(tolower(static_cast<unsigned char>(ch)));
        const int base = base_rank[lower - 'a'];
        // Any uppercase letter is lexicographically greater than any lowercase letter.
        return base + (is_upper ? 26 : 0);
    };

    sort(
        words.begin(),
        words.end(),
        [&](const string& lhs, const string& rhs) {
            const int len_l = static_cast<int>(lhs.size());
            const int len_r = static_cast<int>(rhs.size());
            const int common = min(len_l, len_r);
            for (int i = 0; i < common; ++i) {
                const int rl = char_rank(lhs[i]);
                const int rr = char_rank(rhs[i]);
                if (rl != rr) {
                    return rl < rr;
                }
            }
            return len_l < len_r;
        }
    );

    for (const string& word : words) {
        cout << word << '\n';
    }
    return 0;
}
